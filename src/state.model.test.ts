import {
  beginShuffle,
  endShuffle,
  beginSwap,
  endSwap,
  beginSolve,
  endSolve,
  getMoveCount,
  historyFromState,
  getCounterText,
  solved,
  initialState,
  GameState,
} from "./state.model";
import { _, Board, Idx } from "./model";

describe("state.model", () => {
  const testBoard: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, _];
  
  describe("initial state", () => {
    it("should start with solved state", () => {
      expect(initialState).toEqual(solved);
      expect(initialState.kind).toBe("Solved");
    });
  });

  describe("beginShuffle", () => {
    it("should transition to shuffling state", () => {
      const result = beginShuffle(solved, 5);
      
      expect(result.kind).toBe("Shuffling");
      if (result.kind === "Shuffling") {
        expect(result.shuffles).toHaveLength(5);
        expect(result.history).toEqual(result.shuffles);
        expect(result.board).not.toEqual(solved.board);
      }
    });

    it("should work from any state", () => {
      const notSolvedState: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [[15, 14]],
        moveCount: 1,
      };
      
      const result = beginShuffle(notSolvedState, 3);
      
      expect(result.kind).toBe("Shuffling");
      if (result.kind === "Shuffling") {
        expect(result.shuffles).toHaveLength(3);
      }
    });
  });

  describe("endShuffle", () => {
    it("should transition to not solved state", () => {
      const shufflingState: GameState = {
        kind: "Shuffling",
        board: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, _, 14],
        shuffles: [[15, 14]],
        history: [[15, 14]],
      };
      
      const result = endShuffle(shufflingState);
      
      expect(result.kind).toBe("NotSolved");
      expect(result.board).toEqual(shufflingState.board);
      if (result.kind === "NotSolved") {
        expect(result.swappables).toContain(13); // 13 is adjacent to blank at 14
        expect(result.history).toEqual([[15, 14]]);
        expect(result.moveCount).toBe(0);
      }
    });

    it("should transition to solved if board is accidentally solved", () => {
      const shufflingState: GameState = {
        kind: "Shuffling",
        board: solved.board,
        shuffles: [[15, 14], [14, 15]],
        history: [[15, 14], [14, 15]],
      };
      
      const result = endShuffle(shufflingState);
      
      expect(result.kind).toBe("Solved");
      expect(result.board).toEqual(solved.board);
    });
  });

  describe("beginSwap", () => {
    it("should transition to swapping state", () => {
      const notSolvedState: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [],
        moveCount: 0,
      };
      
      const result = beginSwap(notSolvedState, 14 as Idx);
      
      expect(result.kind).toBe("Swapping");
      if (result.kind === "Swapping") {
        expect(result.swaps).toEqual([[15, 14]]);
        expect(result.history).toEqual([[15, 14]]);
        expect(result.moveCount).toBe(1);
      }
      expect(result.board).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, _, 14]);
    });

    it("should increment move count", () => {
      const notSolvedState: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [[15, 14]],
        moveCount: 5,
      };
      
      const result = beginSwap(notSolvedState, 11 as Idx);
      
      if (result.kind === "Swapping") {
        expect(result.moveCount).toBe(6);
      }
    });

    it("should preserve history", () => {
      const notSolvedState: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [[15, 14], [14, 15]],
        moveCount: 2,
      };
      
      const result = beginSwap(notSolvedState, 11 as Idx);
      
      if (result.kind === "Swapping") {
        expect(result.history).toEqual([[15, 14], [14, 15], [15, 11]]);
      }
    });
  });

  describe("endSwap", () => {
    it("should transition to not solved state", () => {
      const swappingState: GameState = {
        kind: "Swapping",
        board: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, _, 14],
        swaps: [[15, 14]],
        history: [[15, 14]],
        moveCount: 1,
      };
      
      const result = endSwap(swappingState);
      
      expect(result.kind).toBe("NotSolved");
      expect(result.board).toEqual(swappingState.board);
      if (result.kind === "NotSolved") {
        expect(result.moveCount).toBe(1);
      }
    });

    it("should transition to solved if puzzle is complete", () => {
      const swappingState: GameState = {
        kind: "Swapping",
        board: solved.board,
        swaps: [[14, 15]],
        history: [[15, 14], [14, 15]],
        moveCount: 2,
      };
      
      const result = endSwap(swappingState);
      
      expect(result.kind).toBe("Solved");
      if (result.kind === "Solved") {
        expect(result.moveCount).toBe(2);
      }
    });
  });

  describe("beginSolve", () => {
    it("should transition to solving state with reversed history", () => {
      const notSolvedState: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [[15, 14], [14, 11], [11, 15]],
        moveCount: 3,
      };
      
      const result = beginSolve(notSolvedState);
      
      expect(result.kind).toBe("Solving");
      expect(result.board).toEqual(testBoard);
      if (result.kind === "Solving") {
        expect(result.solution).toEqual([[11, 15], [14, 11], [15, 14]]);
      }
    });

    it("should work with empty history", () => {
      const result = beginSolve(solved);
      
      expect(result.kind).toBe("Solving");
      if (result.kind === "Solving") {
        expect(result.solution).toEqual([]);
      }
    });
  });

  describe("endSolve", () => {
    it("should always return solved state", () => {
      const result = endSolve();
      
      expect(result).toEqual(solved);
    });
  });

  describe("getMoveCount", () => {
    it("should return move count for NotSolved state", () => {
      const state: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [],
        moveCount: 5,
      };
      
      expect(getMoveCount(state)).toBe(5);
    });

    it("should return move count for Swapping state", () => {
      const state: GameState = {
        kind: "Swapping",
        board: testBoard,
        swaps: [[15, 14]],
        history: [[15, 14]],
        moveCount: 3,
      };
      
      expect(getMoveCount(state)).toBe(3);
    });

    it("should return move count for Solved state with count", () => {
      const state: GameState = {
        kind: "Solved",
        board: solved.board,
        moveCount: 10,
      };
      
      expect(getMoveCount(state)).toBe(10);
    });

    it("should return 0 for Solved state without count", () => {
      expect(getMoveCount(solved)).toBe(0);
    });

    it("should return 0 for Shuffling state", () => {
      const state: GameState = {
        kind: "Shuffling",
        board: testBoard,
        shuffles: [[15, 14]],
        history: [[15, 14]],
      };
      
      expect(getMoveCount(state)).toBe(0);
    });

    it("should return 0 for Solving state", () => {
      const state: GameState = {
        kind: "Solving",
        board: testBoard,
        solution: [[15, 14]],
      };
      
      expect(getMoveCount(state)).toBe(0);
    });
  });

  describe("historyFromState", () => {
    it("should return history for NotSolved state", () => {
      const state: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [[15, 14], [14, 11]],
        moveCount: 2,
      };
      
      expect(historyFromState(state)).toEqual([[15, 14], [14, 11]]);
    });

    it("should return history for Swapping state", () => {
      const state: GameState = {
        kind: "Swapping",
        board: testBoard,
        swaps: [[15, 14]],
        history: [[15, 14]],
        moveCount: 1,
      };
      
      expect(historyFromState(state)).toEqual([[15, 14]]);
    });

    it("should return history for Shuffling state", () => {
      const state: GameState = {
        kind: "Shuffling",
        board: testBoard,
        shuffles: [[15, 14]],
        history: [[15, 14]],
      };
      
      expect(historyFromState(state)).toEqual([[15, 14]]);
    });

    it("should return empty array for Solved state", () => {
      expect(historyFromState(solved)).toEqual([]);
    });

    it("should return empty array for Solving state", () => {
      const state: GameState = {
        kind: "Solving",
        board: testBoard,
        solution: [[15, 14]],
      };
      
      expect(historyFromState(state)).toEqual([]);
    });
  });

  describe("getCounterText", () => {
    it("should return 'shuffle to start' for initial solved state", () => {
      expect(getCounterText(solved)).toBe("shuffle to start");
    });

    it("should return 'shuffling...' for shuffling state", () => {
      const state: GameState = {
        kind: "Shuffling",
        board: testBoard,
        shuffles: [[15, 14]],
        history: [[15, 14]],
      };
      
      expect(getCounterText(state)).toBe("shuffling...");
    });

    it("should return 'solving...' for solving state", () => {
      const state: GameState = {
        kind: "Solving",
        board: testBoard,
        solution: [[15, 14]],
      };
      
      expect(getCounterText(state)).toBe("solving...");
    });

    it("should return move count for NotSolved state", () => {
      const state: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [[15, 14]],
        moveCount: 1,
      };
      
      expect(getCounterText(state)).toBe("1 move");
    });

    it("should return plural moves for multiple moves", () => {
      const state: GameState = {
        kind: "NotSolved",
        board: testBoard,
        swappables: [14, 11],
        history: [[15, 14], [14, 11]],
        moveCount: 5,
      };
      
      expect(getCounterText(state)).toBe("5 moves");
    });

    it("should return move count for Swapping state", () => {
      const state: GameState = {
        kind: "Swapping",
        board: testBoard,
        swaps: [[15, 14]],
        history: [[15, 14]],
        moveCount: 3,
      };
      
      expect(getCounterText(state)).toBe("3 moves");
    });

    it("should return move count for Solved state with moves", () => {
      const state: GameState = {
        kind: "Solved",
        board: solved.board,
        moveCount: 7,
      };
      
      expect(getCounterText(state)).toBe("7 moves");
    });
  });
});
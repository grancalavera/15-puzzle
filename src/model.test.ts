import {
  _,
  Board,
  isSolved,
  applyAllSwaps,
  applyOneSwap,
  Swap,
  getSwappables,
  Swappables,
  getSwap,
  getRandomSwaps,
  shuffleBoard,
  getRowIdx,
  getColIdx,
  isBlank,
  gridCount,
  cellCount,
} from "./model";

describe("solving puzzles", () => {
  it("should not be solved", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14];
    expect(isSolved(board)).toBe(false);
  });

  it("should be solved", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    expect(isSolved(board)).toBe(true);
  });
});

describe("swapping cells", () => {
  describe("blank can never swap", () => {
    const board: Board = [
      ...[_, 0, 0, 0],
      ...[0, 0, 0, 0],
      ...[0, 0, 0, 0],
      ...[0, 0, 0, 0],
    ] as Board;

    it("calculate", () => {
      const actual = getSwap(board, 0);
      expect(actual).toEqual([]);
    });
  });

  describe("forwards swaps", () => {
    const board: Board = [
      ...[0, 0, 0, 3],
      ...[0, 0, 0, 4],
      ...[0, 0, 0, 5],
      ...[6, 7, 8, _],
    ] as Board;

    describe("one vertical swap", () => {
      const expectedSwaps: Swap[] = [[15, 11]];

      const expectedBoard: Board = [
        ...[0, 0, 0, 3],
        ...[0, 0, 0, 4],
        ...[0, 0, 0, _],
        ...[6, 7, 8, 5],
      ] as Board;

      it("calculate", () => {
        const actual = getSwap(board, 11);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("more than one vertical swap is not allowed", () => {
      const expectedSwaps: Swap[] = [];

      it("calculate", () => {
        const actual = getSwap(board, 7);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(board);
      });
    });

    describe("one horizontal swap", () => {
      const expectedSwaps: Swap[] = [[15, 14]];

      const expectedBoard: Board = [
        ...[0, 0, 0, 3],
        ...[0, 0, 0, 4],
        ...[0, 0, 0, 5],
        ...[6, 7, _, 8],
      ] as Board;

      it("calculate", () => {
        const actual = getSwap(board, 14);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("more than one horizontal swap is not allowed", () => {
      const expectedSwaps: Swap[] = [];
      const actualSwaps = getSwap(board, 13);

      it("calculate", () => {
        expect(actualSwaps).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, actualSwaps);
        expect(actual).toEqual(board);
      });
    });
  });

  describe("backwards swaps", () => {
    const board: Board = [
      ...[_, 3, 4, 5],
      ...[6, 0, 0, 0],
      ...[7, 0, 0, 0],
      ...[8, 0, 0, 0],
    ] as Board;

    it("forbidden vertical swap", () => {
      const actual = getSwap(board, 5);
      expect(actual).toEqual([]);
    });

    describe("one vertical swap", () => {
      const expectedSwaps: Swap[] = [[0, 4]];
      const expectedBoard: Board = [
        ...[6, 3, 4, 5],
        ...[_, 0, 0, 0],
        ...[7, 0, 0, 0],
        ...[8, 0, 0, 0],
      ] as Board;

      it("calculate", () => {
        const actual = getSwap(board, 4);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("more than one vertical swap is not allowed", () => {
      const expectedSwaps: Swap[] = [];

      it("calculate", () => {
        const actual = getSwap(board, 8);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(board);
      });
    });

    describe("one horizontal swap", () => {
      const expectedSwaps: Swap[] = [[0, 1]];

      const expectedPreview: Board = [
        ...[3, _, 4, 5],
        ...[6, 0, 0, 0],
        ...[7, 0, 0, 0],
        ...[8, 0, 0, 0],
      ] as Board;

      it("calculate", () => {
        const actual = getSwap(board, 1);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedPreview);
      });
    });

    describe("more than one horizontal swap is not allowed", () => {
      const expectedSwaps: Swap[] = [];
      const actualSwaps = getSwap(board, 2);

      it("calculate", () => {
        expect(actualSwaps).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, actualSwaps);
        expect(actual).toEqual(board);
      });
    });
  });
});

describe("swappable cells", () => {
  type Scenario = {
    name: string;
    board: Board;
    expected: Swappables;
  };

  const scenarios: Scenario[] = [
    {
      name: "blank at 15",
      board: [
        ...[0, 1, 2, 3],
        ...[4, 5, 6, 7],
        ...[8, 9, 10, 11],
        ...[12, 13, 14, _],
      ] as Board,
      expected: [14, 11],
    },
    {
      name: "blank at 0",
      board: [
        ...[_, 1, 2, 3],
        ...[4, 5, 6, 7],
        ...[8, 9, 10, 11],
        ...[12, 13, 14, 15],
      ] as Board,
      expected: [1, 4],
    },
    {
      name: "blank at 14",
      board: [
        ...[0, 1, 2, 3],
        ...[4, 5, 6, 7],
        ...[8, 9, 10, 11],
        ...[12, 13, _, 15],
      ] as Board,
      expected: [13, 15, 10],
    },
  ];

  describe.each(scenarios)("$name", ({ board, expected }) => {
    it("find swappable cells", () => {
      const actual = getSwappables(board);
      expect(actual).toEqual(expected);
    });
  });
});

describe("board constants", () => {
  it("should have correct grid count", () => {
    expect(gridCount).toBe(4);
  });

  it("should have correct cell count", () => {
    expect(cellCount).toBe(16);
  });

  it("should identify blank cell", () => {
    expect(isBlank(_)).toBe(true);
    expect(isBlank(15)).toBe(true);
    expect(isBlank(0)).toBe(false);
    expect(isBlank(14)).toBe(false);
  });
});

describe("board utilities", () => {
  describe("getRowIdx", () => {
    it("should return correct row indices", () => {
      expect(getRowIdx(0)).toBe(0); // first row
      expect(getRowIdx(3)).toBe(0); // first row
      expect(getRowIdx(4)).toBe(1); // second row
      expect(getRowIdx(7)).toBe(1); // second row
      expect(getRowIdx(12)).toBe(3); // last row
      expect(getRowIdx(15)).toBe(3); // last row
    });
  });

  describe("getColIdx", () => {
    it("should return correct column indices", () => {
      expect(getColIdx(0)).toBe(0); // first column
      expect(getColIdx(4)).toBe(0); // first column
      expect(getColIdx(3)).toBe(3); // last column
      expect(getColIdx(15)).toBe(3); // last column
      expect(getColIdx(5)).toBe(1); // second column
    });
  });
});

describe("single swap operations", () => {
  it("should apply one swap correctly", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, _];
    const swap: Swap = [15, 14];
    const result = applyOneSwap(board, swap);
    const expected: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, _, 14];
    expect(result).toEqual(expected);
  });

  it("should not mutate original board", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, _];
    const original = [...board];
    const swap: Swap = [15, 14];
    applyOneSwap(board, swap);
    expect(board).toEqual(original);
  });
});

describe("random swaps", () => {
  it("should return valid swaps for any board", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, _];
    const swaps = getRandomSwaps(board);
    expect(swaps).toHaveLength(1);
    
    // Should be swapping with blank position
    const [swap] = swaps;
    expect(swap).toBeDefined();
    expect(swap).toContain(15); // blank position
  });

  it("should return swaps only with adjacent tiles", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, _, 12, 13, 14, 15];
    const swaps = getRandomSwaps(board);
    const [swap] = swaps;
    const swappables = getSwappables(board);
    
    // The non-blank position should be in swappables
    const nonBlankPos = swap?.find(pos => pos !== 11);
    expect(swappables).toContain(nonBlankPos);
  });
});

describe("board shuffling", () => {
  it("should shuffle board with specified number of moves", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, _];
    const count = 10;
    const result = shuffleBoard(board, count);
    
    expect(result.shuffles).toHaveLength(count);
    expect(result.board).not.toEqual(board); // Should be different after shuffling
  });

  it("should produce valid swaps during shuffle", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, _];
    const count = 5;
    const result = shuffleBoard(board, count);
    
    // Each swap should involve the blank position from the current board state
    let currentBoard = board;
    for (const swap of result.shuffles) {
      const blankIdx = currentBoard.indexOf(_);
      expect(swap).toContain(blankIdx);
      currentBoard = applyOneSwap(currentBoard, swap);
    }
  });

  it("should not produce reverse swaps consecutively", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, _];
    const count = 20;
    const result = shuffleBoard(board, count);
    
    // Check that no consecutive swaps are reverses of each other
    for (let i = 0; i < result.shuffles.length - 1; i++) {
      const [a1, a2] = result.shuffles[i]!;
      const [b1, b2] = result.shuffles[i + 1]!;
      
      // Should not be reverse swap
      expect(a1 === b2 && a2 === b1).toBe(false);
    }
  });

  it("should handle edge case of zero shuffles", () => {
    const board: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, _];
    const result = shuffleBoard(board, 0);
    
    expect(result.shuffles).toHaveLength(0);
    expect(result.board).toEqual(board);
  });
});

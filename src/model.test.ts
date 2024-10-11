import {
  _,
  Board,
  isSolved,
  applyAllSwaps,
  Swap,
  getSwappables,
  Swappables,
  getSwaps,
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
      const actual = getSwaps(board, 0);
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
        const actual = getSwaps(board, 11);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("two vertical swaps", () => {
      const expectedSwaps: Swap[] = [
        [15, 11],
        [11, 7],
      ];

      const expectedBoard: Board = [
        ...[0, 0, 0, 3],
        ...[0, 0, 0, _],
        ...[0, 0, 0, 4],
        ...[6, 7, 8, 5],
      ] as Board;

      it("calculate", () => {
        const actual = getSwaps(board, 7);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("three vertical swaps", () => {
      const expectedSwaps: Swap[] = [
        [15, 11],
        [11, 7],
        [7, 3],
      ];

      const expectedBoard: Board = [
        ...[0, 0, 0, _],
        ...[0, 0, 0, 3],
        ...[0, 0, 0, 4],
        ...[6, 7, 8, 5],
      ] as Board;

      it("calculate", () => {
        const actual = getSwaps(board, 3);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
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
        const actual = getSwaps(board, 14);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("two horizontal swaps", () => {
      const expectedSwaps: Swap[] = [
        [15, 14],
        [14, 13],
      ];

      const expectedBoard: Board = [
        ...[0, 0, 0, 3],
        ...[0, 0, 0, 4],
        ...[0, 0, 0, 5],
        ...[6, _, 7, 8],
      ] as Board;

      it("calculate", () => {
        const actual = getSwaps(board, 13);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("three horizontal swaps", () => {
      const expectedSwaps: Swap[] = [
        [15, 14],
        [14, 13],
        [13, 12],
      ];

      const expectedBoard: Board = [
        ...[0, 0, 0, 3],
        ...[0, 0, 0, 4],
        ...[0, 0, 0, 5],
        ...[_, 6, 7, 8],
      ] as Board;

      it("calculate", () => {
        const actual = getSwaps(board, 12);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
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
      const actual = getSwaps(board, 5);
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
        const actual = getSwaps(board, 4);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("two vertical swaps", () => {
      const expectedSwaps: Swap[] = [
        [0, 4],
        [4, 8],
      ];

      const expectedBoard: Board = [
        ...[6, 3, 4, 5],
        ...[7, 0, 0, 0],
        ...[_, 0, 0, 0],
        ...[8, 0, 0, 0],
      ] as Board;

      it("calculate", () => {
        const actual = getSwaps(board, 8);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("three vertical swaps", () => {
      const expectedSwaps: Swap[] = [
        [0, 4],
        [4, 8],
        [8, 12],
      ];

      const expectedBoard: Board = [
        ...[6, 3, 4, 5],
        ...[7, 0, 0, 0],
        ...[8, 0, 0, 0],
        ...[_, 0, 0, 0],
      ] as Board;

      it("calculate", () => {
        const actual = getSwaps(board, 12);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
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
        const actual = getSwaps(board, 1);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedPreview);
      });
    });

    describe("two horizontal swaps", () => {
      const expectedSwaps: Swap[] = [
        [0, 1],
        [1, 2],
      ];

      const expectedBoard: Board = [
        ...[3, 4, _, 5],
        ...[6, 0, 0, 0],
        ...[7, 0, 0, 0],
        ...[8, 0, 0, 0],
      ] as Board;

      it("calculate", () => {
        const actual = getSwaps(board, 2);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    describe("three horizontal swaps", () => {
      const expectedSwaps: Swap[] = [
        [0, 1],
        [1, 2],
        [2, 3],
      ];

      const expectedBoard: Board = [
        ...[3, 4, 5, _],
        ...[6, 0, 0, 0],
        ...[7, 0, 0, 0],
        ...[8, 0, 0, 0],
      ] as Board;

      it("calculate", () => {
        const actual = getSwaps(board, 3);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = applyAllSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
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
      expected: [12, 13, 14, 3, 7, 11],
    },
    {
      name: "blank at 0",
      board: [
        ...[_, 1, 2, 3],
        ...[4, 5, 6, 7],
        ...[8, 9, 10, 11],
        ...[12, 13, 14, 15],
      ] as Board,
      expected: [1, 2, 3, 4, 8, 12],
    },
    {
      name: "blank at 14",
      board: [
        ...[0, 1, 2, 3],
        ...[4, 5, 6, 7],
        ...[8, 9, 10, 11],
        ...[12, 13, _, 15],
      ] as Board,
      expected: [12, 13, 15, 2, 6, 10],
    },
  ];

  describe.each(scenarios)("$name", ({ board, expected }) => {
    it("find swappable cells", () => {
      const actual = getSwappables(board);
      expect(actual).toEqual(expected);
    });
  });
});

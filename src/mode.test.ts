import {
  _,
  Board,
  calculateSwaps,
  isSolved,
  previewSwaps,
  Swap,
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
  describe("backwards swaps", () => {
    const board: Board = [
      ...[_, 3, 4, 5],
      ...[6, 0, 0, 0],
      ...[7, 0, 0, 0],
      ...[8, 0, 0, 0],
    ] as Board;

    it("blank can never swap", () => {
      const actual = calculateSwaps(board, _);
      expect(actual).toEqual([]);
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
        const actual = calculateSwaps(board, 1);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = previewSwaps(board, expectedSwaps);
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
        const actual = calculateSwaps(board, 2);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = previewSwaps(board, expectedSwaps);
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
        const actual = calculateSwaps(board, 3);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = previewSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });

    it("forbidden vertical swap", () => {
      const actual = calculateSwaps(board, 5);
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
        const actual = calculateSwaps(board, 4);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = previewSwaps(board, expectedSwaps);
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
        const actual = calculateSwaps(board, 8);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = previewSwaps(board, expectedSwaps);
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
        const actual = calculateSwaps(board, 12);
        expect(actual).toEqual(expectedSwaps);
      });

      it("preview", () => {
        const actual = previewSwaps(board, expectedSwaps);
        expect(actual).toEqual(expectedBoard);
      });
    });
  });
});

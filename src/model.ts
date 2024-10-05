export type Swap = [Idx, Idx];
export type Board = [
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell,
  Cell
];

type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
type Idx = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type { Cell, Idx };

export type NonEmptyArray<T> = [T, ...T[]];
export type Choose<T> = (arr: NonEmptyArray<T>) => T;
export type Swappables = [Idx, Idx, Idx, Idx, Idx, Idx];
export type Row = [Cell, Cell, Cell, Cell];
export type Col = [Cell, Cell, Cell, Cell];

export const _: Cell = 15;

export const gridCount = 4;
export const cellCount = gridCount * gridCount;

export const isBlank = (cell: Cell): boolean => cell === _;

const isSorted = (arr: number[]): boolean => {
  for (let i = 0; i < arr.length - 1; i++) {
    const current = arr[i];
    const next = arr[i + 1];

    if (current === undefined || next === undefined) {
      return false;
    }

    if (current > next) {
      return false;
    }
  }
  return true;
};

export const isSolved = (candidate: Board): boolean => isSorted(candidate);

export const getSwaps = (board: Board, cellIdx: Idx): Swap[] => {
  const blankIdx = getBlankIdx(board);
  const isCell = blankIdx !== undefined && cellIdx !== blankIdx;

  if (isCell && sameRow(blankIdx, cellIdx)) {
    return swapHorizontally(blankIdx, cellIdx);
  }

  if (isCell && sameCol(blankIdx, cellIdx)) {
    return swapVertically(blankIdx, cellIdx);
  }

  return [];
};

const swapHorizontally = (blankIdx: Idx, cellIdx: Idx): Swap[] => {
  const distance = cellIdx - blankIdx;
  const direction = Math.sign(distance);
  return [...Array(Math.abs(distance)).keys()].map((stepSize) => [
    swapColBy(blankIdx, stepSize * direction),
    swapColBy(blankIdx, stepSize * direction + 1 * direction),
  ]);
};

const swapVertically = (blankIdx: Idx, cellIdx: Idx): Swap[] => {
  const distance = getRowIdx(cellIdx) - getRowIdx(blankIdx);
  const direction = Math.sign(distance);
  return [...Array(Math.abs(distance)).keys()].map((stepSize) => [
    swapRowBy(blankIdx, stepSize * direction),
    swapRowBy(blankIdx, stepSize * direction + 1 * direction),
  ]);
};

export const previewSwaps = (board: Board, swap: [Idx, Idx][]): Board => {
  const preview = [...board];
  swap.forEach(([from, to]) => {
    const temp = preview[from]!;
    preview[from] = preview[to]!;
    preview[to] = temp;
  });
  return preview as Board;
};

const swapColBy = (original: Idx, count: number): Idx => {
  const candidate = original + count;
  return sameRow(original, candidate) ? candidate : original;
};

const swapRowBy = (original: Idx, count: number): Idx => {
  const candidate = original + count * gridCount;
  return sameCol(original, candidate) ? candidate : original;
};

const sameRow = (target: Idx, candidate: number): candidate is Idx => {
  if (!isIdx(candidate)) {
    return false;
  }
  return getRowIdx(target) === getRowIdx(candidate);
};

const sameCol = (target: Idx, candidate: number): candidate is Idx => {
  if (!isIdx(candidate)) {
    return false;
  }
  return getColIdx(target) === getColIdx(candidate);
};

// unsafe
export const getRowIdx = (index: Idx): Idx =>
  Math.floor(index / gridCount) as Idx;

// unsafe
export const getColIdx = (index: Idx): Idx => (index % gridCount) as Idx;

// unsafe
const getRow = (row: Idx): Row =>
  [
    row * gridCount,
    row * gridCount + 1,
    row * gridCount + 2,
    row * gridCount + 3,
  ] as Row;

// unsafe
const getCol = (col: Idx): Col =>
  [col, col + gridCount, col + gridCount * 2, col + gridCount * 3] as Col;

const getBlankIdx = (board: Board): Idx => {
  const candidate = board.indexOf(_);
  if (!isIdx(candidate)) {
    throw new Error("Invalid board: blank not found");
  }
  return candidate;
};

const isIdx = (candidate: number): candidate is Idx =>
  candidate >= 0 && candidate < cellCount;

const choose = <T>(arr: [T, ...T[]]): T => {
  return arr[Math.floor(Math.random() * arr.length)]!;
};

export const randomSwaps = (board: Board): Swap[] => {
  const idx = choose(getSwappables(board));
  return getSwaps(board, idx);
};

export const getSwappables = (board: Board): Swappables => {
  const blankIdx = getBlankIdx(board);
  return [
    ...getRow(getRowIdx(blankIdx)),
    ...getCol(getColIdx(blankIdx)),
  ].filter((idx) => idx !== blankIdx) as Swappables;
};

export const getRandomSwaps = (board: Board): Swap[] => {
  const idx = choose(getSwappables(board));
  return getSwaps(board, idx);
};

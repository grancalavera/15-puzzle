type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
type Idx = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

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

export const _: Cell = 15;

const rowCount = 4;
const colCount = 4;

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

type IsSolved = (board: Board) => boolean;
export const isSolved: IsSolved = isSorted;

export const calculateSwaps = (board: Board, cellIdx: Idx): Swap[] => {
  const blankIdx = getIdx(board, _);
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
  const sign = Math.sign(distance);
  const abs = Math.abs(distance);
  return [...Array(abs).keys()].map((i) => {
    const a = swapColBy(blankIdx, i * sign);
    const b = swapColBy(blankIdx, i * sign + 1 * sign);
    return [a, b];
  });
};

const swapVertically = (blankIdx: Idx, cellIdx: Idx): Swap[] => {
  const distance = Math.abs(getRow(blankIdx) - getRow(cellIdx));
  return [...Array(distance).keys()].map((i) => [
    swapRowBy(blankIdx, i),
    swapRowBy(blankIdx, i + 1),
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
  const candidate = original + count * rowCount;
  return sameCol(original, candidate) ? candidate : original;
};

const sameRow = (target: Idx, candidate: number): candidate is Idx => {
  if (!isIdx(candidate)) {
    return false;
  }
  return getRow(target) === getRow(candidate);
};

const sameCol = (target: Idx, candidate: number): candidate is Idx => {
  if (!isIdx(candidate)) {
    return false;
  }
  return getCol(target) === getCol(candidate);
};

const getRow = (index: Idx) => Math.floor(index / rowCount);
const getCol = (index: Idx) => index % colCount;

const getIdx = (board: Board, cell: Cell): Idx | undefined => {
  const candidate = board.indexOf(cell);
  return isIdx(candidate) ? candidate : undefined;
};

const isIdx = (candidate: number): candidate is Idx =>
  candidate >= 0 && candidate < rowCount * colCount;

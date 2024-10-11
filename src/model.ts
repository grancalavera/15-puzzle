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
export type Swappables = NonEmptyArray<Idx>;
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

  if (
    (isCell && isHorizontalNeighbor(blankIdx, cellIdx)) ||
    isVerticalNeighbor(blankIdx, cellIdx)
  ) {
    return [[blankIdx, cellIdx]];
  }

  return [];
};

export const applyAllSwaps = (board: Board, swaps: [Idx, Idx][]): Board =>
  swaps.reduce(applyOneSwap, board);

export const applyOneSwap = (board: Board, [from, to]: Swap): Board => {
  const draft = [...board];
  const temp = draft[from]!;
  draft[from] = draft[to]!;
  draft[to] = temp;
  return draft as Board;
};

const isHorizontalNeighbor = (
  target: Idx,
  candidate: number
): candidate is Idx => {
  const distance = Math.abs(target - candidate);
  return (
    isIdx(candidate) &&
    getRowIdx(target) === getRowIdx(candidate) &&
    distance === 1
  );
};

const isVerticalNeighbor = (
  target: Idx,
  candidate: number
): candidate is Idx => {
  if (!isIdx(candidate)) {
    return false;
  }
  const distance = Math.abs(getRowIdx(target) - getRowIdx(candidate));
  return getColIdx(target) === getColIdx(candidate) && distance === 1;
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
    ...getRow(getRowIdx(blankIdx)).filter((candidate) =>
      isHorizontalNeighbor(blankIdx, candidate)
    ),
    ...getCol(getColIdx(blankIdx)).filter((candidate) =>
      isVerticalNeighbor(blankIdx, candidate)
    ),
  ].filter((idx) => idx !== blankIdx) as Swappables;
};

export const getRandomSwaps = (board: Board): Swap[] => {
  const swappables = getSwappables(board);
  const idx = choose(swappables);
  return getSwaps(board, idx);
};

export const shuffleBoard = (board: Board, count: number): [Board, Swap[]] => {
  const shuffles: Swap[] = [];

  let remaining = count;
  let shuffledBoard = board;

  while (remaining > 0) {
    const swaps = getRandomSwaps(shuffledBoard);
    shuffles.push(...swaps);
    shuffledBoard = applyAllSwaps(shuffledBoard, swaps);
    remaining--;
  }

  return [shuffledBoard, shuffles];
};

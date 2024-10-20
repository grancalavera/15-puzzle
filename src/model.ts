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

type Shuffle = {
  board: Board;
  shuffles: Swap[];
};

export const _: Cell = 15;

export const gridCount = 4;
export const cellCount = gridCount * gridCount;

export const isBlank = (cell: Cell): boolean => cell === _;

export const isSolved = (candidate: Board): boolean => isSorted(candidate);

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

export const getSwaps = (board: Board, cellIdx: Idx): [Swap] | [] => {
  const blankIdx = getBlankIdx(board);
  const h = isHorizontalNeighbor(cellIdx);
  const v = isVerticalNeighbor(cellIdx);

  if (cellIdx !== blankIdx && (h(blankIdx) || v(blankIdx))) {
    return [[blankIdx, cellIdx]];
  }

  return [];
};

export const applyAllSwaps = (board: Board, swaps: Swap[]): Board =>
  swaps.reduce(applyOneSwap, board);

export const applyOneSwap = (board: Board, [a, b]: Swap): Board => {
  const draft = [...board];
  const temp = draft[a]!;
  draft[a] = draft[b]!;
  draft[b] = temp;
  return draft as Board;
};

const isHorizontalNeighbor =
  (candidate: Idx) =>
  (target: Idx): boolean => {
    const distance = Math.abs(target - candidate);
    return getRowIdx(target) === getRowIdx(candidate) && distance === 1;
  };

const isVerticalNeighbor =
  (candidate: Idx) =>
  (target: Idx): boolean => {
    const distance = Math.abs(getRowIdx(target) - getRowIdx(candidate));
    return getColIdx(target) === getColIdx(candidate) && distance === 1;
  };

// unsafe
export const getRowIdx = (i: Idx): Idx => Math.floor(i / gridCount) as Idx;

// unsafe
export const getColIdx = (i: Idx): Idx => (i % gridCount) as Idx;

// unsafe
const getRowForIdx = (i: Idx): Row => {
  const rowStart = getRowIdx(i);
  return [
    rowStart * gridCount,
    rowStart * gridCount + 1,
    rowStart * gridCount + 2,
    rowStart * gridCount + 3,
  ] as Row;
};

// unsafe
const getColForIdx = (i: Idx): Col => {
  const colStart = getColIdx(i);
  return [
    colStart,
    colStart + gridCount,
    colStart + gridCount * 2,
    colStart + gridCount * 3,
  ] as Col;
};

const getBlankIdx = (board: Board): Idx => {
  const candidate = board.indexOf(_);
  if (!isIdx(candidate)) {
    throw new Error("Invalid board: blank not found");
  }
  return candidate;
};

const isIdx = (candidate: number): candidate is Idx =>
  candidate >= 0 && candidate < cellCount;

const choose = <T>(arr: NonEmptyArray<T>): T =>
  arr[Math.floor(Math.random() * arr.length)]!;

export const getSwappables = (board: Board): Swappables => {
  const blankIdx = getBlankIdx(board);
  return [
    ...getRowForIdx(blankIdx).filter(isHorizontalNeighbor(blankIdx)),
    ...getColForIdx(blankIdx).filter(isVerticalNeighbor(blankIdx)),
  ] as Swappables;
};

export const getRandomSwaps = (board: Board): Swap[] => {
  const swappables = getSwappables(board);
  const idx = choose(swappables);
  return getSwaps(board, idx);
};

/**
 * Checks if the next Swap to apply is the same as the last applied Swap
 * but in reverse order, and if it is, it skips it.
 * @param shuffles list of swaps to apply to a board
 * @param candidate a Swap to check against the last Swap in the list
 * @returns candidate is Swap
 */
const isValidSwap = (shuffles: Swap[], candidate: Swap): candidate is Swap => {
  const lastShuffle = shuffles[shuffles.length - 1];
  if (!lastShuffle) return true;

  const [a1, a2] = lastShuffle;
  const [b2, b1] = candidate;

  return a1 !== b1 || a2 !== b2;
};

export const shuffleBoard = (board: Board, count: number): Shuffle => {
  const shuffles: Swap[] = [];

  let remaining = count;
  let shuffledBoard = board;

  while (remaining > 0) {
    const [nextSwap] = getRandomSwaps(shuffledBoard);

    if (!nextSwap || !isValidSwap(shuffles, nextSwap)) {
      continue;
    }

    shuffles.push(nextSwap);
    shuffledBoard = applyOneSwap(shuffledBoard, nextSwap);
    remaining--;
  }

  return { board: shuffledBoard, shuffles };
};

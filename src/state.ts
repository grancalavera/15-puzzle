import { scan, Subject } from "rxjs";
import { assertNever } from "./assertNever";
import { mergeWithKey } from "./mergeWithKey";
import {
  _,
  applyAllSwaps,
  Board,
  getSwappables,
  getSwaps,
  Idx,
  isSolved,
  shuffleBoard,
  Swap,
  Swappables,
} from "./model";

export type GameState = NotSolved | Solved | Swapping | Shuffling;

type NotSolved = {
  kind: "NotSolved";
  board: Board;
  swappables: Swappables;
};

type Swapping = {
  kind: "Swapping";
  board: Board;
  swaps: Swap[];
};

type Solved = {
  kind: "Solved";
  board: Board;
};

type Shuffling = {
  kind: "Shuffling";
  board: Board;
  shuffles: Swap[];
};

const notSolved = (board: Board): GameState => ({
  kind: "NotSolved",
  board,
  swappables: getSwappables(board),
});

const solved: GameState = {
  kind: "Solved",
  board: [
    ...[0, 1, 2, 3],
    ...[4, 5, 6, 7],
    ...[8, 9, 10, 11],
    ...[12, 13, 14, _],
  ] as Board,
};

const swapping = (board: Board, idx: Idx): GameState => {
  const swaps = getSwaps(board, idx);
  return {
    kind: "Swapping",
    board: applyAllSwaps(board, swaps),
    swaps: swaps,
  };
};

const shuffling = (board: Board): GameState => {
  const [shuffledBoard, shuffles] = shuffleBoard(board, 100);
  return {
    kind: "Shuffling",
    board: shuffledBoard,
    shuffles,
  };
};

const beginSwap$ = new Subject<Idx>();
const endSwap$ = new Subject<void>();
const beginShuffle$ = new Subject<void>();
const endShuffle$ = new Subject<void>();

export const beginSwap = beginSwap$.next.bind(beginSwap$);
export const endSwap = endSwap$.next.bind(endSwap$);
export const beginShuffle = beginShuffle$.next.bind(beginShuffle$);
export const endShuffle = endShuffle$.next.bind(endShuffle$);

const fromBoard = (board: Board): GameState =>
  isSolved(board) ? solved : notSolved(board);

export const initialState = fromBoard(solved.board);

const action$ = mergeWithKey({
  beginSwap$,
  endSwap$,
  beginShuffle$,
  endShuffle$,
});

export const state$ = action$.pipe(
  scan((state, action) => {
    switch (action.type) {
      case "beginSwap$": {
        return swapping(state.board, action.payload);
      }

      case "beginShuffle$": {
        return shuffling(state.board);
      }

      case "endSwap$": {
        return fromBoard(state.board);
      }

      case "endShuffle$": {
        return fromBoard(state.board);
      }

      default:
        assertNever(action);
    }
  }, initialState)
);

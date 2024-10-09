import { map, scan, Subject } from "rxjs";
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
  Swap,
  Swappables,
} from "./model";

export type GameState = NotSolved | Solved | Swapping;

type NotSolved = {
  kind: "NotSolved";
  board: Board;
  swappables: Swappables;
};

const notSolved = (board: Board): GameState => ({
  kind: "NotSolved",
  board,
  swappables: getSwappables(board),
});

type Solved = {
  kind: "Solved";
  board: Board;
};

const solved: GameState = {
  kind: "Solved",
  board: [
    ...[0, 1, 2, 3],
    ...[4, 5, 6, 7],
    ...[8, 9, 10, 11],
    ...[12, 13, 14, _],
  ] as Board,
};

type Swapping = {
  kind: "Swapping";
  board: Board;
  swaps: Swap[];
};

const swapping = (board: Board, idx: Idx): GameState => {
  const swaps = getSwaps(board, idx);
  return {
    kind: "Swapping",
    board: applyAllSwaps(board, swaps),
    swaps: swaps,
  };
};

const beginSwap$ = new Subject<Idx>();
const endSwap$ = new Subject<void>();

export const beginSwap = beginSwap$.next.bind(beginSwap$);
export const endSwap = endSwap$.next.bind(endSwap$);

const fromBoard = (board: Board): GameState =>
  isSolved(board) ? solved : notSolved(board);

export const initialState = fromBoard([
  ...[0, 1, 2, 3],
  ...[4, 5, 6, 7],
  ...[_, 8, 9, 10],
  ...[12, 13, 14, 11],
] as Board);

const action$ = mergeWithKey({
  beginSwap$,
  endSwap$,
});

export const state$ = action$.pipe(
  scan((state, action) => {
    switch (action.type) {
      case "beginSwap$": {
        return swapping(state.board, action.payload);
      }

      case "endSwap$": {
        return fromBoard(state.board);
      }

      default:
        assertNever(action);
    }
  }, initialState)
);

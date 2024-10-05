import { scan, Subject } from "rxjs";
import {
  _,
  Board,
  getSwappables,
  getSwaps,
  Idx,
  isSolved,
  previewSwaps,
  Swappables,
} from "./model";

type GameState = {
  board: Board;
  swappables: Swappables;
  isSolved: boolean;
};

const swap$ = new Subject<Idx>();
export const swap = (idx: Idx) => swap$.next(idx);

const fromBoard = (board: Board): GameState => ({
  board,
  swappables: getSwappables(board),
  isSolved: isSolved(board),
});

export const initialState = fromBoard([
  ...[0, 1, 2, 3],
  ...[4, 5, 6, 7],
  ...[8, 9, 10, 11],
  ...[12, _, 13, 14],
] as Board);

export const state$ = swap$.pipe(
  scan((state, idx) => {
    const swaps = getSwaps(state.board, idx);
    if (swaps.length === 0) return state;
    const board = previewSwaps(state.board, swaps);
    return fromBoard(board);
  }, initialState)
);

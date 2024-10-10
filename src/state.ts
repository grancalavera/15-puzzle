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
import { shuffleCount } from "./settings";

export type GameState = NotSolved | Solved | Swapping | Shuffling | Solving;

type NotSolved = {
  kind: "NotSolved";
  board: Board;
  swappables: Swappables;
  history: Swap[];
};

type Swapping = {
  kind: "Swapping";
  board: Board;
  swaps: Swap[];
  history: Swap[];
};

type Shuffling = {
  kind: "Shuffling";
  board: Board;
  shuffles: Swap[];
  history: Swap[];
};

type Solved = {
  kind: "Solved";
  board: Board;
};

type Solving = {
  kind: "Solving";
  board: Board;
  // reversed history
  solution: Swap[];
};

const notSolved = (board: Board, history: Swap[]): GameState => ({
  kind: "NotSolved",
  board,
  swappables: getSwappables(board),
  history,
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

const swapping = (board: Board, idx: Idx, history: Swap[]): GameState => {
  const swaps = getSwaps(board, idx);
  return {
    kind: "Swapping",
    board: applyAllSwaps(board, swaps),
    swaps: swaps,
    history: [...history, ...swaps],
  };
};

const shuffling = (board: Board): GameState => {
  const [shuffledBoard, shuffles] = shuffleBoard(board, shuffleCount);
  return {
    kind: "Shuffling",
    board: shuffledBoard,
    shuffles,
    history: [...shuffles],
  };
};

const beginSwap$ = new Subject<Idx>();
const endSwap$ = new Subject<void>();
const beginShuffle$ = new Subject<void>();
const endShuffle$ = new Subject<void>();
const beginSolve$ = new Subject<void>();
const endSolve$ = new Subject<void>();

export const beginSwap = beginSwap$.next.bind(beginSwap$);
export const endSwap = endSwap$.next.bind(endSwap$);
export const beginShuffle = beginShuffle$.next.bind(beginShuffle$);
export const endShuffle = endShuffle$.next.bind(endShuffle$);
export const beginSolve = beginSolve$.next.bind(beginSolve$);
export const endSolve = endSolve$.next.bind(endSolve$);

const stateFromBoard = (board: Board, history: Swap[] = []): GameState =>
  isSolved(board) ? solved : notSolved(board, history);

const historyFromState = (state: GameState): Swap[] =>
  state.kind === "Solved" || state.kind === "Solving" ? [] : state.history;

export const initialState = stateFromBoard([
  ...[0, 1, 2, 3],
  ...[4, 5, 6, 7],
  ...[8, 9, 10, 11],
  ...[12, 13, 14, _],
] as Board);

const action$ = mergeWithKey({
  beginSwap$,
  endSwap$,
  beginShuffle$,
  endShuffle$,
  beginSolve$,
  endSolve$,
});

export const state$ = action$.pipe(
  scan((state, action) => {
    const history = historyFromState(state);

    switch (action.type) {
      case "beginSwap$": {
        return swapping(state.board, action.payload, history);
      }

      case "beginShuffle$": {
        return shuffling(state.board);
      }

      case "endSwap$": {
        return stateFromBoard(state.board, history);
      }

      case "endShuffle$": {
        return stateFromBoard(state.board, history);
      }

      case "beginSolve$": {
        const solving: Solving = {
          kind: "Solving",
          board: solved.board,
          solution: [...history].reverse(),
        };
        return solving;
      }

      case "endSolve$": {
        return solved;
      }

      default:
        assertNever(action);
    }
  }, initialState)
);

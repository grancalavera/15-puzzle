import { scan, Subject } from "rxjs";
import { assertNever } from "./assertNever";
import { mergeWithKey } from "./mergeWithKey";
import {
  _,
  applyAllSwaps,
  Board,
  getSwappables,
  getSwap,
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
  moves: number;
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
  moves: number;
};

type Solving = {
  kind: "Solving";
  board: Board;
  // reversed history
  solution: Swap[];
};

const notSolved = (board: Board, history: Swap[] = []): GameState => ({
  kind: "NotSolved",
  board,
  swappables: getSwappables(board),
  history,
  moves: 0,
});

const f = (state: GameState): GameState => {
  const history = historyFromState(state);
  const { board } = state;
  return {
    kind: "NotSolved",
    board,
    swappables: getSwappables(board),
    history,
    moves: 0,
  };
};

const solved: GameState = {
  kind: "Solved",
  moves: 0,
  board: [
    ...[0, 1, 2, 3],
    ...[4, 5, 6, 7],
    ...[8, 9, 10, 11],
    ...[12, 13, 14, _],
  ] as Board,
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

const historyFromState = (state: GameState): Swap[] =>
  state.kind === "Solved" || state.kind === "Solving" ? [] : state.history;

export const initialState = notSolved([
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
    switch (action.type) {
      case "beginSwap$": {
        const swap = getSwap(state.board, action.payload);
        const board = applyAllSwaps(state.board, swap);
        const s: GameState = {
          kind: "Swapping",
          board,
          swaps: swap,
          history: [...historyFromState(state), ...swap],
        };
        return s;
      }

      case "beginShuffle$": {
        const { board, shuffles } = shuffleBoard(state.board, shuffleCount);
        const s: GameState = {
          kind: "Shuffling",
          board: board,
          // either one of these two needs to be made into another reference
          shuffles: shuffles,
          history: [...shuffles],
        };
        return s;
      }

      case "endSwap$": {
        return isSolved(state.board)
          ? solved
          : notSolved(state.board, historyFromState(state));
      }

      case "endShuffle$": {
        // this is an anomaly: at the end of a shuffle the game should
        // never be solved but it can happen by chance. ideally if shuffling
        // ends in a solved state, the board should be shuffled again but I
        // don't know where to trigger that subsequent shuffle from.
        return isSolved(state.board)
          ? solved
          : notSolved(state.board, historyFromState(state));
      }

      case "beginSolve$": {
        const s: GameState = {
          kind: "Solving",
          board: state.board,
          solution: [...historyFromState(state)].reverse(),
        };
        return s;
      }

      case "endSolve$": {
        return solved;
      }

      default:
        assertNever(action);
    }
  }, initialState)
);

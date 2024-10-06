import { distinctUntilChanged, scan, Subject } from "rxjs";
import { assertNever } from "./assertNever";
import { mergeWithKey } from "./mergeWithKey";
import {
  _,
  applySwap,
  Board,
  getSwappables,
  getSwaps,
  Idx,
  isSolved,
  Swap,
  Swappables,
} from "./model";
import { isEqual } from "lodash";

type GameState = PrimaryState & DerivedState;

type PrimaryState = {
  board: Board;
  swaps: Swap[];
  shuffles: number;
};

type DerivedState = {
  swappables: Swappables;
  isSolved: boolean;
};

const requestSwap$ = new Subject<Idx>();
const applyNextSwap$ = new Subject<void>();
const shuffle$ = new Subject<number>();

export const requestSwap = (idx: Idx) => requestSwap$.next(idx);
export const applyNextSwap = () => applyNextSwap$.next();
export const shuffle = (shuffles: number) => shuffle$.next(shuffles);

const update = (current: GameState, next: Partial<PrimaryState> = {}) => {
  const updated = { ...current, ...next };
  return derive(updated);
};

const derive = (state: PrimaryState): GameState => ({
  ...state,
  swappables: getSwappables(state.board),
  isSolved: isSolved(state.board),
});

export const initialState = derive({
  board: [
    ...[0, 1, 2, 3],
    ...[4, 5, 6, 7],
    ...[8, 9, 10, 11],
    ...[12, 13, 14, _],
  ] as Board,
  swaps: [],
  shuffles: 0,
});

const action$ = mergeWithKey({
  requestSwap$,
  applyNextSwap$,
  shuffle$,
});

export const state$ = action$.pipe(
  scan((state, action) => {
    switch (action.type) {
      case "requestSwap$": {
        const idx = action.payload as Idx;
        const swaps = getSwaps(state.board, idx);
        if (swaps.length === 0) return state;
        return update(state, { swaps });
      }

      case "applyNextSwap$": {
        const [nextSwap, ...swaps] = state.swaps;
        if (!nextSwap) return state;
        const board = applySwap(state.board, nextSwap);
        return update(state, { board, swaps });
      }

      case "shuffle$": {
        return state;
      }

      default:
        assertNever(action);
    }
  }, initialState),
  distinctUntilChanged(isEqual)
);

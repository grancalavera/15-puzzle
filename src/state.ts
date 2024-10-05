import { delay, map, of, scan, Subject, switchMap, timer } from "rxjs";
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

type GameState = {
  board: Board;
  swappables: Swappables;
  isSolved: boolean;
  swaps: SwapDescription[];
  hasSwaps: boolean;
};

type SwapDescription = {
  swap: Swap;
  delay: boolean;
};

const swap$ = new Subject<Idx>();
const applyNextSwap$ = new Subject<SwapDescription[]>();

export const hasSwaps = (state: GameState) => state.swaps.length > 0;
export const swap = (idx: Idx) => swap$.next(idx);
export const applyNextSwap = (swaps: SwapDescription[]) =>
  applyNextSwap$.next(swaps);

const update = (board: Board, swaps: SwapDescription[] = []): GameState => ({
  board,
  swaps,
  swappables: getSwappables(board),
  isSolved: isSolved(board),
  hasSwaps: swaps.length > 0,
});

export const initialState = update([
  ...[0, 1, 2, 3],
  ...[4, 5, 6, 7],
  ...[8, 9, 10, 11],
  ...[12, 13, 14, _],
] as Board);

const action$ = mergeWithKey({
  swap$,
  applyNextSwap$: applyNextSwap$.pipe(
    switchMap((swapDescription) => {
      const [next] = swapDescription;
      return timer(next?.delay ? 250 : 0).pipe(map(() => swapDescription));
    })
  ),
});

export const state$ = action$.pipe(
  scan((state, action) => {
    switch (action.type) {
      case "swap$": {
        const idx = action.payload as Idx;
        const swaps = getSwaps(state.board, idx).map((swap, i) => ({
          swap,
          delay: i !== 0,
        }));
        if (swaps.length === 0) return state;
        return update(state.board, swaps);
      }
      case "applyNextSwap$": {
        const [swapDescription, ...swaps] = action.payload;
        if (!swapDescription) return state;
        const board = applySwap(state.board, swapDescription.swap);
        return update(board, swaps);
      }

      default:
        assertNever(action);
    }
    // const swaps = getSwaps(state.board, idx);
    // if (swaps.length === 0) return state;
    // return { ...state, swaps };
  }, initialState)
);

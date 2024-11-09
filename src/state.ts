import { scan, Subject } from "rxjs";
import { assertNever } from "./assertNever";
import { mergeWithKey } from "./mergeWithKey";
import { Idx } from "./model";
import { shuffleCount } from "./settings";
import * as stateModel from "./state.model";
import { initialState } from "./state.model";

const beginShuffle$ = new Subject<void>();
const endShuffle$ = new Subject<void>();

const beginSwap$ = new Subject<Idx>();
const endSwap$ = new Subject<void>();

const beginSolve$ = new Subject<void>();
const endSolve$ = new Subject<void>();

const setter = <T>(s: Subject<T>) => s.next.bind(s);

export const beginSwap = setter(beginSwap$);
export const endSwap = setter(endSwap$);
export const beginShuffle = setter(beginShuffle$);
export const endShuffle = setter(endShuffle$);
export const beginSolve = setter(beginSolve$);
export const endSolve = setter(endSolve$);

const action$ = mergeWithKey({
  beginShuffle$,
  endShuffle$,
  beginSwap$,
  endSwap$,
  beginSolve$,
  endSolve$,
});

export const state$ = action$.pipe(
  scan((state, action) => {
    switch (action.type) {
      case "beginShuffle$": {
        return stateModel.beginShuffle(state, shuffleCount);
      }

      case "endShuffle$": {
        return stateModel.endShuffle(state);
      }

      case "beginSwap$": {
        return stateModel.beginSwap(state, action.payload);
      }

      case "endSwap$": {
        return stateModel.endSwap(state);
      }

      case "beginSolve$": {
        return stateModel.beginSolve(state);
      }

      case "endSolve$": {
        return stateModel.endSolve();
      }

      default:
        assertNever(action);
    }
  }, initialState)
);

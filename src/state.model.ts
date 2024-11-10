import {
  _,
  applyAllSwaps,
  Board,
  getSwap,
  getSwappables,
  Idx,
  isSolved,
  shuffleBoard,
  Swap,
  Swappables,
} from "./model";

export type GameState = Solved | NotSolved | Swapping | Shuffling | Solving;

type NotSolved = {
  kind: "NotSolved";
  board: Board;
  swappables: Swappables;
  history: Swap[];
  moveCount: number;
};

type Swapping = {
  kind: "Swapping";
  board: Board;
  swaps: Swap[];
  history: Swap[];
  moveCount: number;
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
  // because we only keep the move count when the user solved the game themselves, if the game is solved by us, we don't know how many moves it took
  moveCount?: number;
};

type Solving = {
  kind: "Solving";
  board: Board;
  // reversed history
  solution: Swap[];
};

export const solved: GameState = {
  kind: "Solved",
  board: [
    ...[0, 1, 2, 3],
    ...[4, 5, 6, 7],
    ...[8, 9, 10, 11],
    ...[12, 13, 14, _],
  ] as Board,
};

export const getMoveCount = (state: GameState): number =>
  state.kind === "NotSolved" || state.kind === "Swapping"
    ? state.moveCount
    : state.kind === "Solved"
    ? state.moveCount ?? 0
    : 0;

export const historyFromState = (state: GameState): Swap[] =>
  state.kind === "Solved" || state.kind === "Solving" ? [] : state.history;

export const initialState: GameState = solved;

export const beginShuffle = (
  state: GameState,
  shuffleCount: number
): GameState => {
  const { board, shuffles } = shuffleBoard(state.board, shuffleCount);
  return {
    kind: "Shuffling",
    board,
    shuffles,
    history: [...shuffles],
  };
};

export const endShuffle = (state: GameState): GameState =>
  // this is an anomaly: at the end of a shuffle the game should
  // never be solved but it can happen by chance. ideally if shuffling
  // ends in a solved state, the board should be shuffled again but I
  // don't know where to trigger that subsequent shuffle from.
  isSolved(state.board)
    ? solved
    : {
        kind: "NotSolved",
        board: state.board,
        swappables: getSwappables(state.board),
        history: historyFromState(state),
        moveCount: 0,
      };

export const beginSwap = (state: GameState, idx: Idx): GameState => {
  const swaps = getSwap(state.board, idx);
  const board = applyAllSwaps(state.board, swaps);
  const history = [...historyFromState(state), ...swaps];
  const moveCount = getMoveCount(state) + 1;
  return {
    kind: "Swapping",
    board,
    swaps,
    history,
    moveCount,
  };
};

export const endSwap = (state: GameState): GameState => {
  const moveCount = getMoveCount(state);

  return isSolved(state.board)
    ? { ...solved, moveCount }
    : {
        kind: "NotSolved",
        board: state.board,
        swappables: getSwappables(state.board),
        history: historyFromState(state),
        moveCount,
      };
};

export const beginSolve = (state: GameState): GameState => ({
  kind: "Solving",
  board: state.board,
  solution: [...historyFromState(state).reverse()],
});

export const endSolve = (): GameState => solved;

export const getCounterText = (state: GameState): string => {
  if (state.kind === "Solved" && state.moveCount === undefined) {
    return "shuffle to start";
  }

  if (state.kind === "Shuffling") {
    return "shuffling...";
  }

  if (state.kind === "Solving") {
    return "solving...";
  }

  const moveCount = getMoveCount(state);
  return `${moveCount} move${moveCount === 1 ? "" : "s"}`;
};

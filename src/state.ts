import { assign, fromPromise, setup, SnapshotFrom } from "xstate";
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
} from "./model";
import { shuffleCount } from "./settings";

export type SwapSpeed = "slow" | "fast";

export type AnimateSwapsInput = { swaps: Swap[]; speed: SwapSpeed };

type GameContext = {
  board: Board;
  // every swap applied since the last shuffle began; replaying it in reverse solves the board
  history: Swap[];
  // swaps the view has to animate while in shuffling, swapping or solving
  pending: Swap[];
  // undefined when there is no player score to show: before the first shuffle,
  // during a shuffle, or after the game solved the board itself
  moveCount: number | undefined;
};

type GameEvent =
  | { type: "SHUFFLE" }
  | { type: "SWAP"; idx: Idx }
  | { type: "SOLVE" };

export const solvedBoard: Board = [
  ...[0, 1, 2, 3],
  ...[4, 5, 6, 7],
  ...[8, 9, 10, 11],
  ...[12, 13, 14, _],
] as Board;

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  actors: {
    // the view replaces this with the real tile animation via `gameMachine.provide`;
    // the default resolves immediately, which is what tests want
    animateSwaps: fromPromise<void, AnimateSwapsInput>(async () => {}),
  },
  guards: {
    isBoardSolved: ({ context }) => isSolved(context.board),
    isSwappable: ({ context, event }) =>
      event.type === "SWAP" && getSwap(context.board, event.idx).length > 0,
  },
  actions: {
    resetToSolved: assign({
      board: solvedBoard,
      history: [],
      pending: [],
      moveCount: undefined,
    }),
  },
}).createMachine({
  id: "game",
  initial: "solved",
  context: {
    board: solvedBoard,
    history: [],
    pending: [],
    moveCount: undefined,
  },
  states: {
    solved: {
      on: {
        SHUFFLE: {
          target: "shuffling",
          actions: assign(({ context }) => {
            const { board, shuffles } = shuffleBoard(
              context.board,
              shuffleCount
            );
            return {
              board,
              history: shuffles,
              pending: shuffles,
              moveCount: undefined,
            };
          }),
        },
      },
    },

    shuffling: {
      invoke: {
        src: "animateSwaps",
        input: ({ context }) => ({ swaps: context.pending, speed: "fast" }),
        onDone: [
          // a shuffle can land on a solved board by chance
          { guard: "isBoardSolved", target: "solved", actions: "resetToSolved" },
          { target: "playing", actions: assign({ pending: [], moveCount: 0 }) },
        ],
      },
    },

    playing: {
      on: {
        SWAP: {
          guard: "isSwappable",
          target: "swapping",
          actions: assign(({ context, event }) => {
            const swaps = getSwap(context.board, event.idx);
            return {
              board: applyAllSwaps(context.board, swaps),
              history: [...context.history, ...swaps],
              pending: swaps,
              moveCount: (context.moveCount ?? 0) + 1,
            };
          }),
        },
        SOLVE: {
          target: "solving",
          actions: assign(({ context }) => ({
            pending: [...context.history].reverse(),
          })),
        },
      },
    },

    swapping: {
      invoke: {
        src: "animateSwaps",
        input: ({ context }) => ({ swaps: context.pending, speed: "slow" }),
        onDone: [
          {
            // the player solved it: keep moveCount as their score
            guard: "isBoardSolved",
            target: "solved",
            actions: assign({ history: [], pending: [] }),
          },
          { target: "playing", actions: assign({ pending: [] }) },
        ],
      },
    },

    solving: {
      invoke: {
        src: "animateSwaps",
        input: ({ context }) => ({ swaps: context.pending, speed: "fast" }),
        onDone: { target: "solved", actions: "resetToSolved" },
      },
    },
  },
});

export type GameSnapshot = SnapshotFrom<typeof gameMachine>;

export const getSwappableIdxs = (snapshot: GameSnapshot): Idx[] =>
  snapshot.matches("playing") ? getSwappables(snapshot.context.board) : [];

export const getCounterText = (snapshot: GameSnapshot): string => {
  if (snapshot.matches("shuffling")) return "shuffling...";
  if (snapshot.matches("solving")) return "solving...";

  const { moveCount } = snapshot.context;
  if (moveCount === undefined) return "shuffle to start";

  return `${moveCount} move${moveCount === 1 ? "" : "s"}`;
};

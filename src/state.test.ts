import { describe, expect, it } from "vitest";
import { createActor, waitFor } from "xstate";
import { getSwappables, Idx, isSolved } from "./model";
import { gameMachine, getCounterText, getSwappableIdxs, solvedBoard } from "./state";

const settled = (actor: ReturnType<typeof createActor<typeof gameMachine>>) =>
  waitFor(actor, (s) => s.matches("playing") || s.matches("solved"));

const startShuffled = async () => {
  const actor = createActor(gameMachine).start();
  actor.send({ type: "SHUFFLE" });
  expect(actor.getSnapshot().value).toBe("shuffling");
  expect(getCounterText(actor.getSnapshot())).toBe("shuffling...");
  await settled(actor);
  return actor;
};

describe("gameMachine", () => {
  it("starts solved with nothing swappable", () => {
    const actor = createActor(gameMachine).start();
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("solved");
    expect(snapshot.context.board).toEqual(solvedBoard);
    expect(getSwappableIdxs(snapshot)).toEqual([]);
    expect(getCounterText(snapshot)).toBe("shuffle to start");
  });

  it("ignores swaps and solve while solved", () => {
    const actor = createActor(gameMachine).start();
    actor.send({ type: "SWAP", idx: 14 });
    actor.send({ type: "SOLVE" });
    expect(actor.getSnapshot().value).toBe("solved");
  });

  it("shuffles into playing with a zero move count", async () => {
    const actor = await startShuffled();
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("playing");
    expect(isSolved(snapshot.context.board)).toBe(false);
    expect(snapshot.context.history.length).toBeGreaterThan(0);
    expect(getSwappableIdxs(snapshot)).toEqual(
      getSwappables(snapshot.context.board)
    );
    expect(getCounterText(snapshot)).toBe("0 moves");
  });

  it("ignores swaps on tiles that are not next to the blank", async () => {
    const actor = await startShuffled();
    const before = actor.getSnapshot();
    const swappables = getSwappableIdxs(before);
    const notSwappable = ([...Array(16).keys()] as Idx[]).find(
      (i) => !swappables.includes(i)
    );
    actor.send({ type: "SWAP", idx: notSwappable! });
    expect(actor.getSnapshot()).toBe(before);
  });

  it("counts a swap and records it in history", async () => {
    const actor = await startShuffled();
    const { history } = actor.getSnapshot().context;
    const [idx] = getSwappableIdxs(actor.getSnapshot());

    actor.send({ type: "SWAP", idx: idx! });
    expect(actor.getSnapshot().value).toBe("swapping");
    expect(getSwappableIdxs(actor.getSnapshot())).toEqual([]);

    await settled(actor);
    const snapshot = actor.getSnapshot();
    expect(snapshot.context.moveCount).toBe(1);
    expect(snapshot.context.history).toHaveLength(history.length + 1);
    expect(getCounterText(snapshot)).toBe("1 move");
  });

  it("solves the board for the player without keeping a score", async () => {
    const actor = await startShuffled();
    actor.send({ type: "SOLVE" });
    expect(actor.getSnapshot().value).toBe("solving");
    expect(getCounterText(actor.getSnapshot())).toBe("solving...");

    await settled(actor);
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("solved");
    expect(snapshot.context.board).toEqual(solvedBoard);
    expect(getCounterText(snapshot)).toBe("shuffle to start");
  });

  it("keeps the move count when the player solves the board", async () => {
    const actor = await startShuffled();
    const reversed = [...actor.getSnapshot().context.history].reverse();

    // each swap is [blankIdx, cellIdx]; tapping the old blank position undoes it
    for (const [blankIdx] of reversed) {
      actor.send({ type: "SWAP", idx: blankIdx });
      await settled(actor);
    }

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("solved");
    expect(snapshot.context.moveCount).toBe(reversed.length);
    expect(getCounterText(snapshot)).toBe(`${reversed.length} moves`);
  });
});

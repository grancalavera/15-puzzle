# 15-puzzle

[Play](https://grancalavera.github.io/15-puzzle/)

## Game state

The game state is an [XState](https://stately.ai/docs/xstate) machine, `gameMachine` in [`src/state.ts`](src/state.ts). The diagram below is generated from that machine definition.

```mermaid
stateDiagram-v2
  [*] --> solved
  shuffling: shuffling (invoke animateSwaps)
  swapping: swapping (invoke animateSwaps)
  solving: solving (invoke animateSwaps)

  solved --> shuffling: SHUFFLE
  shuffling --> solved: done [isBoardSolved]
  shuffling --> playing: done
  playing --> swapping: SWAP [isSwappable]
  playing --> solving: SOLVE
  swapping --> solved: done [isBoardSolved]
  swapping --> playing: done
  solving --> solved: done
```

- `SHUFFLE`, `SWAP` and `SOLVE` are the events the UI sends.
- `done` means the invoked `animateSwaps` actor has finished animating the tiles. The view supplies this actor through `gameMachine.provide`.
- When a transition has guarded and unguarded versions, the machine tries the guarded one first. For example, a shuffle can land on a solved board by chance, and then the machine goes back to `solved`.

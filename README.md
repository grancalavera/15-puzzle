# 15-puzzle

[Play](https://grancalavera.github.io/15-puzzle/)

```mermaid
stateDiagram
    a: Solved (a)
    b: Shuffling (b)
    c: Not Solved (c)
    d: Swapping (d)

    state c1 <<choice>>
    state c2 <<choice>>
    state c3 <<choice>>

    [*] --> a

    a --> b: requestShuffle
    b --> c1: shuffle
    c1 --> b: hasShuffles
    c1 --> c: noShuffles

    c --> b: requestShuffle
    c --> d: requestSwap
    d --> c2: swap
    c2 --> d: hasSwaps
    c2 --> c3: noSwaps
    c3 --> c: notSolved
    c3 --> a: solved

    e: Solving (e)
    state c4 <<choice>>
    c --> e: requestSolve
    e --> c4: popHistory
    c4 --> e: hasHistory
    c4 --> a: solved
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development**: `npm run dev` - Starts Vite dev server
- **Build**: `npm run build` - TypeScript compilation + Vite build
- **Preview**: `npm run preview` - Preview production build
- **Test**: `npm run test` - Run Vitest tests (watch mode)
- **Test Single File**: `npm run test -- model.test.ts` - Run specific test file
- **Type Check**: `npm run typecheck` - TypeScript type checking without emit

## Architecture

This is a 15-puzzle game built with PixiJS, TypeScript, and RxJS using a reactive state management pattern.

### State Management
- **Reactive**: Uses RxJS streams with state$ observable at the core
- **State Machine**: Five states: Solved, NotSolved, Swapping, Shuffling, Solving (see README.md mermaid diagram)
- **Actions**: Dispatched via Subject streams (beginShuffle$, endShuffle$, beginSwap$, endSwap$, beginSolve$, endSolve$)
- **State Transitions**: Handled in `state.ts` using scan operator with pure functions from `state.model.ts`

### Core Game Logic
- **Board Model**: 4x4 grid with cells 0-15 (15 is blank), defined as fixed-size tuples in `model.ts`
- **Swapping**: Only tiles adjacent to blank (15) can be swapped
- **Animation**: GSAP handles tile animations with different speeds for user moves vs shuffling/solving

### Rendering
- **PixiJS**: Main rendering engine with custom components in `components/` directory
- **Components**: Box, Button, Label, Switch, and Tile (with BlankTile subclass)
- **Layout**: Fixed grid with padding, responsive to settings in `settings.ts`

### Key Files
- `main.ts`: Application entry point, UI setup, and state subscription
- `model.ts`: Pure game logic, board manipulation, and validation
- `state.ts` & `state.model.ts`: Reactive state management
- `components/Tile.ts`: Main game piece with swap animations

### Testing
- **Framework**: Vitest with global test functions enabled
- **Existing Tests**: Comprehensive unit tests for `model.ts` and `state.model.ts`
- **Test Files**: Located alongside source files with `.test.ts` suffix
- **Configuration**: Vite handles test configuration with TypeScript support
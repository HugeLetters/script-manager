# Script Manager - Agent Development Guide

## Project Overview
This is a TypeScript project using the Effect library for functional programming. It provides script management capabilities with VS Code extension support.

## Agent Instructions
When working on this codebase:
- Always run `bun run lint` and `bun run typecheck` before completing tasks
- Use Effect patterns for all async operations
- Follow existing code conventions and import organization
- Check package.json for available scripts and dependencies

## Development Commands
```bash
# Build and Development
bun run build          # Only builds the project
bun run release        # Build, package and install
bun run dev            # Like release, but in watch mode
bun run package        # Only packages the extension

# Code Quality
bun run format         # Format code with Biome
bun run lint           # Lint code with Biome  
bun run typecheck      # TypeScript type checking
```

## Architecture Principles

### Core Framework
- **Effect Library**: Use Effect for all async operations and error handling
- **Functional Programming**: Prefer pure functions and immutable data structures
- **Type Safety**: Strict TypeScript configuration with comprehensive type checking

### Code Standards
- **Formatting**: Tab indentation, double quotes (handled by Biome)
- **Imports**: Use `$/*` path aliases, let Biome organize imports automatically
- **Naming**: PascalCase for types/classes, camelCase for functions/variables
- **Error Handling**: Custom error types extending `Data.TaggedError`
- **TypeScript**: Strict mode enabled with `noUncheckedIndexedAccess` and `noImplicitOverride`

## Effect Patterns

### Service Layer
- Wrap external libraries in Effect services
- Use `Effect.Service` with tag-based identification
- Convert library errors to custom Effect error types
- Leverage Effect's resource management for cleanup

### Effect Functions
- Use `Effect.gen` for complex async operations
- Use `Effect.fn` for reusable tagged functions
- Handle optional values with `Option` utilities
- Process arrays with `Arr` utilities for type safety

### Concurrency
- Use `Effect.all` with concurrency options for parallel processing
- Prefer concurrent operations over sequential when possible

## Module System

### Path Handling
- Resolve `$/*` aliases from project root
- Use standard Node.js path utilities for cross-platform compatibility
- Parse import declarations for module resolution

### AST Processing
- Use TypeScript's symbol resolution for accurate code analysis
- Prefer ts-morph type-safe methods over generic operations
- Use `isKind()` methods for node type checking

## Development Workflow

### Validation
- Run `bun run lint` and `bun run typecheck` before committing
- No test framework - focus on static analysis validation
- Ensure Biome formatting is applied

### Error Handling Strategy
- Create specific error types for different failure modes
- Use `Effect.try` for wrapping unsafe operations
- Use `Effect.tryPromise` for wrapping async functions
- Provide meaningful error context for debugging

## Key Libraries
- **Effect**: Functional programming and error handling
- **ts-morph**: TypeScript AST manipulation
- **Biome**: Code formatting and linting
- **VS Code API**: Extension development
- **simple-git**: Git operations wrapper
- **esbuild**: Fast JavaScript bundler

## Project Structure Notes
- Source code in `src/` with organized feature directories
- Service layer for external library integrations
- Utility functions for common operations
- VS Code specific code separated in dedicated directory

## Runtime Environment

### Build vs Runtime Code
- **Build scripts** (in `src/scripts/`) can use Bun APIs and run in Bun environment
- **Extension code** (everything else) runs in VS Code's Node.js environment and must use Node.js-compatible APIs

### Logging Guidelines
- **Do not use `console.log()`** or similar Node.js logging methods in extension code - these will not appear anywhere
- **Use Effect logging APIs** like `Effect.log()` or `Console.log()` - these are configured to output to VS Code Output panel
- **Use `MainOutputChannel`** from `$/vscode/console.ts` for direct VS Code Output tab access
- **Logs appear in "Script Manager" channel** in the Output tab
- **Effect runtime crashes** are automatically reported to the Output channel

## Additional Development Notes
- Use Bun as the primary package manager and runtime
- VS Code extension uses CommonJS module system
- Effect language service configured with namespace imports and aliases
- Biome automatically organizes imports on save
- VS Code settings configured for automatic import organization on save

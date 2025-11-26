# Script Manager

A [VS Code extension](https://code.visualstudio.com/api) for managing custom scripts and commands with [Effect framework](https://effect.website/) integration.

## Prerequisites

Before working with this project, ensure you have the following global dependencies installed:

- **[VS Code](https://code.visualstudio.com/)** - Obviously
- **[Bun](https://bun.sh/)** - Package manager and runtime (required for build scripts and development)



## Available Commands

### Development Commands
```bash
bun run build          # Only builds the project
bun run release        # Build, package and install
bun run dev            # Like release, but in watch mode
bun run package        # Only packages the extension
```

### Code Quality
```bash
bun run format         # Format code with Biome
bun run lint           # Lint code with Biome  
bun run typecheck      # TypeScript type checking
```

## Development Workflow

### Running in Development Mode

1. **Start the extension in debug mode:**
   - Open VS Code
   - Press `F5` or go to `Run > Start Debugging`
   - This will run dev command and launch a new VS Code window (Extension Development Host) with your extension loaded

2. **Making changes:**
   - The `bun run dev` command automatically watches for file changes and rebuilds
   - After updating code, do the following to see changes:
     - **If you updated runtime code**: In command palette run `Developer: Restart Extension Host`
     - **If you updated a command declaration**: In command palette run `Developer: Reload Window`
     - **If you updated a build script**: You need to restart the build command

## Adding Commands

### For Effect Framework Users

```typescript
import * as Effect from "effect/Effect";
import { VsCommand } from "$/vscode/command";

export const YourCommand = new VsCommand.Command({
  id: "your-command-id",
  name: "Your Command Name",
  task: Effect.gen(function* () {
    yield* Effect.log("Command executed");
  }),
});
```

### For Non-Effect Users

If you prefer writing regular async/sync functions, wrap them with Effect:

```typescript
import * as Effect from "effect/Effect";
import { VsCommand } from "$/vscode/command";

// Your regular sync/async function
async function yourFunction() {
  console.log("Command executed");
}

// Wrap with Effect
export const YourCommand = new VsCommand.Command({
	id: "your-command-id",
	name: "Your Command Name",
	task: Effect.tryPromise(async () => yourFunction()),
});
```

## Command Declarations

Add your commands [here](src/commands/index.ts) so that build script can automatically emit those to [package.json](package.json):

```typescript
import type { VsCommand } from "$/vscode/command";
import { YourCommand } from "./your-command";

export const Commands: ReadonlyArray<VsCommand.AnyCommand> = [
  YourCommand,
];
```

However, if you need to manually add command declarations:

1. Edit the [release script](src/scripts/release.ts)
2. Add your command declaration to the appropriate section
```typescript
{
    ...file,
    contributes: {
      ...file.contributes,
      commands: [{ command: "command", title: "Title" }, ...commands],
    },
  };
}
```


### Development Tools

This project uses **[OpenCode](https://opencode.ai/)** for AI-assisted development. While not required, OpenCode provides helpful commands and agents that streamline development workflows. The project includes custom OpenCode commands in the `.opencode/command/` directory.

## Important Notes

### Runtime Environment

- **Logging**: Do not use `console.log()` or similar Node.js logging methods in extension code - these will not appear anywhere. 
  
  Instead you have to use VSCode `OutputChannel` API - these logs will appear in the "Script Manager" (or whatever you name your channel) channel in the Output tab:
  - Use Effect logging APIs like `Effect.log()` or `Console.log()` - these are already configured to output to `OutputChannel`
  - Use `MainOutputChannel` from [`$/vscode/console.ts`](src/vscode/console.ts) for direct `OutputChannel` access
  - Effect runtime crashes are also automatically reported there

### Build vs Runtime Code

- **Build scripts** (in `src/scripts/`) can use Bun APIs and run in Bun environment
- **Extension code** (everything else) runs in VS Code's Node.js environment and must use Node.js-compatible APIs

## Troubleshooting

- **Build fails**: Run `bun run lint` and `bun run typecheck` to identify issues
- **Extension not loading**: Check the VS Code developer console for errors
- **Commands not appearing**: Ensure commands are properly exported in [`src/commands/index.ts`](src/commands/index.ts) and the extension is reloaded
- **Logs not appearing**: Use Effect logging APIs or `MainOutputChannel` instead of `console.log()`
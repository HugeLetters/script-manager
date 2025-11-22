import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import { commands } from "vscode";
import { OutputChannel, VscodeConsoleLive } from "./console";
import { TextEditorService } from "./editor";

type TextEditorCommand = Effect.Effect<void, unknown, TextEditorService>;

export function registerTextEditorCommand(
	name: string,
	command: TextEditorCommand,
) {
	return commands.registerTextEditorCommand(
		`script-manager.${name}`,
		(editor) => {
			return command.pipe(
				Effect.catchAllCause(Effect.logFatal),
				Effect.provide([
					Logger.pretty,
					TextEditorService.Default(editor),
					Layer.provide(VscodeConsoleLive, OutputChannel.Default),
				]),
				Effect.runPromise,
			);
		},
	);
}

export const executeCommand = Effect.fn((command: string) => {
	return Effect.tryPromise({
		try() {
			return commands.executeCommand(command);
		},
		catch(error) {
			return new CommandError({ cause: error });
		},
	});
});

export class CommandError extends Data.TaggedError("CommandError")<{
	cause: unknown;
}> {}

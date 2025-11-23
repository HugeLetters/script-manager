import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { commands } from "vscode";
import { TextEditorService } from "./editor";
import { Runtime, type RuntimeContext } from "./runtime";

export const registerTextEditorCommand = Effect.fn(function* (
	name: string,
	command: Effect.Effect<void, unknown, RuntimeContext | TextEditorService>,
) {
	const run = yield* Runtime;

	return commands.registerTextEditorCommand(
		`script-manager.${name}`,
		(editor) => {
			return command.pipe(
				Effect.provide(TextEditorService.Default(editor)),
				run,
			);
		},
	);
});

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

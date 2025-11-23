import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { commands } from "vscode";
import { asError } from "$/utils/error";
import { Runtime, type RuntimeContext } from "../runtime";
import { TextEditor, TextEditorDirectory } from "./editor";

export const registerTextEditorCommand = Effect.fn(function* (
	name: string,
	command: Effect.Effect<void, unknown, RuntimeContext | TextEditor>,
) {
	const run = yield* Runtime;

	return commands.registerTextEditorCommand(
		`script-manager.${name}`,
		(editor) => {
			return command.pipe(
				Effect.provide([
					Layer.provideMerge(TextEditorDirectory, TextEditor.Default(editor)),
				]),
				run,
			);
		},
	);
});

export class VsCodeCommandError extends Data.TaggedError("VsCodeCommandError")<{
	error: unknown;
}> {
	override cause = asError(this.error);
	override message = this.cause.message;
}

export namespace VsCodeCommand {
	export const execute = Effect.fn((command: string) => {
		return Effect.tryPromise({
			try() {
				return commands.executeCommand(command);
			},
			catch(error) {
				return new VsCodeCommandError({ error });
			},
		});
	});
}

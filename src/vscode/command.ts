import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { commands } from "vscode";
import { CommandPrefix } from "$/config";
import type { SharedRuntimeContext } from "$/runtime";
import { runCommand } from "$/runtime";
import type { CurrentDirectory } from "$/service/directory";
import { asError } from "$/utils/error";
import { TextEditor } from "$/vscode/editor";

export namespace VsCommand {
	interface CommandConfig<C = never> {
		readonly id: string;
		readonly name: string;
		readonly when?: string;
		readonly task: Effect.Effect<void, unknown, SharedRuntimeContext | C>;
	}

	export class Command extends Data.TaggedClass("Command")<CommandConfig> {}

	export class TextCommand extends Data.TaggedClass("TextCommand")<
		CommandConfig<CurrentDirectory | TextEditor>
	> {}

	export type AnyCommand = Command | TextCommand;

	export const registerCommand = Effect.fn(function* (command: Command) {
		const prefix = yield* CommandPrefix;
		return commands.registerCommand(`${prefix}.${command.id}`, () =>
			command.task.pipe(runCommand),
		);
	});

	export const registerTextCommand = Effect.fn(function* (
		command: TextCommand,
	) {
		const prefix = yield* CommandPrefix;
		return commands.registerTextEditorCommand(
			`${prefix}.${command.id}`,
			(editor) => {
				const EditorLayer = Layer.provideMerge(
					TextEditor.CurrentDirectoryLive,
					TextEditor.Default(editor),
				);
				return command.task.pipe(Effect.provide([EditorLayer]), runCommand);
			},
		);
	});

	export const execute = Effect.fn((command: string) => {
		return Effect.tryPromise({
			try() {
				return commands.executeCommand(command);
			},
			catch(error) {
				return new VsCommandError({ error });
			},
		});
	});
}

export class VsCommandError extends Data.TaggedError("VsCommandError")<{
	error: unknown;
}> {
	override cause = asError(this.error);
	override message = this.cause.message;
}

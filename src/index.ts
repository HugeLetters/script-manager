import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { ExtensionContext } from "vscode";
import { InsertTodoComment } from "$/commands/todo";
import { Git } from "$/service/git";
import { registerTextEditorCommand } from "$/vscode/command";
import { TextEditorDirectory } from "$/vscode/editor";
import { RuntimeLive } from "./runtime";

export function activate(context: ExtensionContext) {
	Effect.gen(function* () {
		yield* Effect.log("Activated");

		const todo = yield* registerTextEditorCommand(
			"insert-todo-comment",
			InsertTodoComment.pipe(
				Effect.provide([Layer.provide(Git.Default, TextEditorDirectory)]),
			),
		);

		context.subscriptions.push(todo);
		return yield* Effect.never;
	}).pipe(
		Effect.provide([RuntimeLive]),
		Effect.scoped,
		Effect.catchAllCause(Effect.logFatal),
		Effect.runPromise,
	);
}

export function deactivate() {}

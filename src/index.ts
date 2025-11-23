import * as Effect from "effect/Effect";
import type { ExtensionContext } from "vscode";
import { registerTextEditorCommand } from "$/command";
import { GitService } from "$/git";
import { InsertTodoComment } from "$/todo";
import { RuntimeLayer } from "./runtime";

export function activate(context: ExtensionContext) {
	Effect.gen(function* () {
		yield* Effect.log("Activated");

		const todo = yield* registerTextEditorCommand(
			"insert-todo-comment",
			InsertTodoComment.pipe(Effect.provide(GitService.Default)),
		);

		context.subscriptions.push(todo);
		return yield* Effect.never;
	}).pipe(
		Effect.provide([RuntimeLayer]),
		Effect.scoped,
		Effect.catchAllCause(Effect.logFatal),
		Effect.runPromise,
	);
}

export function deactivate() {}

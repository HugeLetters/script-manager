import * as NodeContext from "@effect/platform-node/NodeContext";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { ExtensionContext } from "vscode";
import { registerTextEditorCommand } from "$/command";
import { GitService } from "$/git";
import { InsertTodoComment } from "$/todo";

// todo - thorough logging

export function activate(context: ExtensionContext) {
	const insertTodoCommentCommand = registerTextEditorCommand(
		"insert-todo-comment",
		InsertTodoComment.pipe(
			Effect.provide([Layer.provide(GitService.Default, NodeContext.layer)]),
		),
	);

	context.subscriptions.push(insertTodoCommentCommand);
}

export function deactivate() {}

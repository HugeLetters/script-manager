import * as Path from "@effect/platform/Path";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type {
	Position,
	Selection,
	TextEditor as VsCodeTextEditor,
} from "vscode";
import { asError } from "$/utils/error";
import { effectify } from "$/utils/promise";
import { CurrentDirectory } from "../service/directory";

interface TextEditorLiveConfig {
	/** @private */
	readonly service: VsCodeTextEditor;
}

export class TextEditor extends Effect.Service<TextEditor>()(
	"script-manager/editor/TextEditor",
	{
		effect(editor: VsCodeTextEditor) {
			return Effect.succeed<TextEditorLiveConfig>({ service: editor });
		},
	},
) {
	use = Effect.fn(
		<T>(
			run: (editor: VsCodeTextEditor) => Thenable<T> | PromiseLike<T> | T,
		) => {
			return Effect.tryPromise({
				try: async () => {
					return run(this.service);
				},
				catch(error) {
					return new TextEditorError({ error });
				},
			});
		},
	);

	edit = Effect.fn(
		effectify(this.service.edit, (error) => new TextEditorError({ error })),
	);

	insert = Effect.fn(
		(
			location: Position,
			value: string,
			options?: Parameters<VsCodeTextEditor["edit"]>[1],
		) => {
			return this.edit((b) => {
				b.insert(location, value);
			}, options);
		},
	);

	get selection() {
		return this.service.selection;
	}
	setSelection(selection: Selection) {
		this.service.selection = selection;
	}
}

export class TextEditorError extends Data.TaggedError("TextEditorError")<{
	error: unknown;
}> {
	override cause = asError(this.error);
	override message = this.cause.message;
}

export const TextEditorDirectory = Layer.effect(
	CurrentDirectory,
	TextEditor.pipe(
		Effect.map((editor) => editor.service.document.uri.fsPath),
		Effect.flatMap((editorPath) =>
			Path.Path.pipe(Effect.map((path) => path.dirname(editorPath))),
		),
	),
);

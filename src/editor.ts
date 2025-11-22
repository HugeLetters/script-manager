import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import type { Position, Selection, TextEditor } from "vscode";
import { effectify } from "./promise";

interface TextEditorLiveConfig {
	/** @private */
	readonly service: TextEditor;
}

export class TextEditorService extends Effect.Service<TextEditorService>()(
	"script-manager/editor/TextEditorService",
	{
		effect(editor: TextEditor) {
			return Effect.succeed<TextEditorLiveConfig>({ service: editor });
		},
	},
) {
	use = Effect.fn(
		<T>(run: (editor: TextEditor) => Thenable<T> | PromiseLike<T> | T) => {
			return Effect.tryPromise({
				try: async () => {
					return run(this.service);
				},
				catch(error) {
					return new TextEditorError({ cause: error });
				},
			});
		},
	);

	edit = Effect.fn(
		effectify(
			this.service.edit,
			(error) => new TextEditorError({ cause: error }),
		),
	);

	insert = Effect.fn(
		(
			location: Position,
			value: string,
			options?: Parameters<TextEditor["edit"]>[1],
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
	cause: unknown;
}> {}

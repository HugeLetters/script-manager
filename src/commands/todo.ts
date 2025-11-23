import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { Selection } from "vscode";
import { Git } from "$/service/git";
import { Str } from "$/utils/string";
import { VsCodeCommand } from "$/vscode/command";
import { TextEditor } from "$/vscode/editor";

export const InsertTodoComment = Effect.gen(function* () {
	yield* Effect.log("Inserting todo comment");

	const editor = yield* TextEditor;
	const git = yield* Git;

	const selection = editor.selection;
	const position = selection.start;
	const lineStartPosition = position.with(undefined, 0);

	yield* editor.insert(lineStartPosition, "\n", {
		undoStopBefore: false,
		undoStopAfter: false,
	});

	editor.setSelection(new Selection(lineStartPosition, lineStartPosition));

	const now = yield* DateTime.nowAsDate;
	const branch = yield* git.branch.pipe(
		Effect.map(Option.map((b) => `${b.current} `)),
		Effect.map(Option.getOrElse(() => null)),
	);
	const preDescrptionChunk = Str.template`TODO ${branch}| `;
	yield* editor.insert(
		lineStartPosition,
		`${preDescrptionChunk} | by Evgenii Perminov at ${now.toUTCString()}`,
		{
			undoStopBefore: false,
			undoStopAfter: false,
		},
	);

	const descriptionPosition = lineStartPosition.with(
		undefined,
		preDescrptionChunk.length,
	);
	editor.setSelection(new Selection(descriptionPosition, descriptionPosition));

	yield* VsCodeCommand.execute("editor.action.addCommentLine");
});

import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { Selection } from "vscode";
import { executeCommand } from "./command";
import { TextEditorService } from "./editor";
import { GitService } from "./git";
import { concat } from "./string";

export const InsertTodoComment = Effect.gen(function* () {
	const editor = yield* TextEditorService;
	const git = yield* GitService;

	const selection = editor.selection;
	const position = selection.start;
	const lineStartPosition = position.with(undefined, 0);

	yield* editor.insert(lineStartPosition, "\n", {
		undoStopBefore: false,
		undoStopAfter: false,
	});

	editor.setSelection(new Selection(lineStartPosition, lineStartPosition));

	const branch = yield* git.branchLocal;
	const now = yield* DateTime.nowAsDate;
	const branchChunk = Option.isSome(branch) ? `${branch.value.current} ` : null;
	const preDescrptionChunk = concat`TODO ${branchChunk}| `;
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

	yield* executeCommand("editor.action.addCommentLine");
});

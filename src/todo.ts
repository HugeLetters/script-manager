import { commands, Selection, type TextEditor } from "vscode";

export async function insertTodoComment(editor: TextEditor) {
	const selection = editor.selection;
	const position = selection.start;
	const lineStartPosition = position.with(undefined, 0);

	// Insert an empty line above
	await editor.edit(
		(b) => {
			b.insert(lineStartPosition, "\n");
		},
		{ undoStopBefore: false, undoStopAfter: false }
	);

	// Move cursor to the new line
	editor.selection = new Selection(lineStartPosition, lineStartPosition);

	// Insert TODO text
	await editor.edit(
		(b) => {
			b.insert(lineStartPosition, "TODO");
		},
		{ undoStopBefore: false, undoStopAfter: false }
	);

	// Use VS Code's built-in comment line command
	await commands.executeCommand("editor.action.addCommentLine");

	editor.selection = new Selection(selection.anchor.translate(1), selection.active.translate(1));
}

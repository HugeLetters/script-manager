// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const insertTodoComment = vscode.commands.registerTextEditorCommand(
		"script-manager.insertTodoComment",
		async (editor, edit) => {
			const selection = editor.selection;
			const position = selection.start;
			const lineStartPosition = position.with(undefined, 0);

			// Insert an empty line above
			await editor.edit(
				(b) => {
					edit.insert(lineStartPosition, "\n");
				},
				{ undoStopBefore: false, undoStopAfter: false }
			);

			// Move cursor to the new line
			editor.selection = new vscode.Selection(lineStartPosition, lineStartPosition);

			// Insert TODO text
			await editor.edit(
				(b) => {
					b.insert(lineStartPosition, "TODO");
				},
				{ undoStopBefore: false, undoStopAfter: false }
			);

			// Use VS Code's built-in comment line command
			await vscode.commands.executeCommand("editor.action.addCommentLine");

			editor.selection = new vscode.Selection(selection.anchor.translate(1), selection.active.translate(1));
		}
	);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "script-manager" is now active!');

	context.subscriptions.push(insertTodoComment);
}

// This method is called when your extension is deactivated
export function deactivate() {}

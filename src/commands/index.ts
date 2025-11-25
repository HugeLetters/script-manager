import type { VsCommand } from "$/vscode/command";
import { InsertTodoComment } from "./todo";

export const Commands: ReadonlyArray<VsCommand.AnyCommand> = [
	InsertTodoComment,
];

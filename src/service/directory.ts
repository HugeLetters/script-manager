import * as Context from "effect/Context";

export class CurrentDirectory extends Context.Tag(
	"script-manager/utils/directory/CurrentDirectory",
)<CurrentDirectory, string>() {}

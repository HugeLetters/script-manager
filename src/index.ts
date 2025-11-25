import { pipe } from "effect";
import * as Arr from "effect/Array";
import * as Effect from "effect/Effect";
import type { ExtensionContext } from "vscode";
import { Commands } from "./commands";

import { VsCommand } from "./vscode/command";

export function activate(context: ExtensionContext) {
	return Effect.gen(function* () {
		yield* Effect.log("Activated");

		const commands = yield* pipe(
			Commands,
			Arr.map((command) => {
				if (command._tag === "TextCommand") {
					return VsCommand.registerTextCommand(command);
				}

				return VsCommand.registerCommand(command);
			}),
			Effect.allWith({ concurrency: "unbounded" }),
		);

		context.subscriptions.push(...commands);
	}).pipe(Effect.tapErrorCause(Effect.logFatal), Effect.runPromise);
}

export function deactivate() {}

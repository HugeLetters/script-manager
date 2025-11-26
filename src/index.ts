import { pipe } from "effect";
import * as Arr from "effect/Array";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import type { ExtensionContext } from "vscode";
import { Commands } from "./commands";
import { SharedRuntimeLive } from "./runtime";
import { VsCommand } from "./vscode/command";

const RegisterCommands = Effect.gen(function* () {
	const registered = yield* pipe(
		Commands,
		Arr.map((command) =>
			pipe(
				command,
				(command) => {
					if (command._tag === "TextCommand") {
						return VsCommand.registerTextCommand(command);
					}

					return VsCommand.registerCommand(command);
				},
				Effect.tapError((cause) =>
					Effect.logError(`Failed to register command ${command.id}`, cause),
				),
				Effect.map((disposable) => {
					return { command, disposable };
				}),
			),
		),
		Effect.allWith({ concurrency: "unbounded", mode: "either" }),
		Effect.map(Arr.getRights),
	);

	yield* Effect.log(
		"Registered commands",
		registered.map(({ command }) => command.id),
	);

	return registered.map(({ disposable }) => disposable);
});

export function activate(context: ExtensionContext) {
	return Effect.gen(function* () {
		yield* Effect.log("Activated");

		const deferredCommands =
			yield* Deferred.make<Effect.Effect.Success<typeof RegisterCommands>>();

		yield* RegisterCommands.pipe(
			Effect.flatMap((v) => Deferred.succeed(deferredCommands, v)),
			Effect.andThen(Effect.never),
			Effect.scoped,
			Effect.tapErrorCause(Effect.logFatal),
			Effect.forkDaemon,
		);

		const commands = yield* Deferred.await(deferredCommands);
		context.subscriptions.push(...commands);
	}).pipe(
		Effect.provide(SharedRuntimeLive),
		Effect.tapErrorCause(Effect.logFatal),
		Effect.runPromise,
	);
}

export function deactivate() {}

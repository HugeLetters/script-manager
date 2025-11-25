import * as NodeContext from "@effect/platform-node/NodeContext";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import { OutputChannel, VsConsoleLive } from "$/vscode/console";

export const SharedRuntimeLive = Layer.mergeAll(
	Logger.pretty,
	VsConsoleLive,
	NodeContext.layer,
).pipe(Layer.provideMerge(OutputChannel.Default));

export type SharedRuntimeContext = Layer.Layer.Success<
	typeof SharedRuntimeLive
>;

export function runCommand(
	effect: Effect.Effect<void, unknown, SharedRuntimeContext>,
) {
	return effect.pipe(
		Effect.provide(SharedRuntimeLive),
		Effect.tapErrorCause(Effect.logFatal),
		Effect.runPromise,
	);
}

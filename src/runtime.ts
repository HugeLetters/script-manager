import * as NodeContext from "@effect/platform-node/NodeContext";
import * as Effect from "effect/Effect";
import * as FiberSet from "effect/FiberSet";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import { OutputChannel, VscodeConsoleLive } from "./console";

export const RuntimeLayer = Layer.mergeAll(
	Logger.pretty,
	VscodeConsoleLive,
	NodeContext.layer,
).pipe(Layer.provideMerge(OutputChannel.Default));

export type RuntimeContext = Layer.Layer.Success<typeof RuntimeLayer>;

export const Runtime = FiberSet.makeRuntime<RuntimeContext>().pipe(
	Effect.map(
		(run) => (effect: Effect.Effect<void, unknown, RuntimeContext>) => {
			return effect.pipe(Effect.catchAllCause(Effect.logFatal), run);
		},
	),
);

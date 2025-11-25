import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FiberHandle from "effect/FiberHandle";
import type { BuildResult, OnEndResult, OnStartResult, Plugin } from "esbuild";

interface PluginConfig<R> {
	name: string;
	onStart?: Effect.Effect<void, unknown, R>;
	onEnd?: (result: BuildResult) => Effect.Effect<void, unknown, R>;
}
class PluginStartError extends Data.TaggedError(
	"PluginStartError",
)<OnStartResult> {}
class PluginEndError extends Data.TaggedError("PluginEndError")<OnEndResult> {}

export const makePlugin = Effect.fn(function* <R>(config: PluginConfig<R>) {
	const run = yield* FiberHandle.makeRuntime<R, null>();

	const plugin: Plugin = {
		name: config.name,
		setup(build) {
			build.onStart(() => {
				return config.onStart?.pipe(
					Effect.catchAll((e) => {
						if (e instanceof PluginStartError) {
							return Effect.succeed(e);
						}

						return Effect.logFatal(e).pipe(Effect.andThen(Effect.fail(null)));
					}),
					run,
					Effect.runPromise,
				);
			});
			build.onEnd((result) => {
				return config.onEnd?.(result).pipe(
					Effect.catchAll((e) => {
						if (e instanceof PluginEndError) {
							return Effect.succeed(e);
						}

						return Effect.logFatal(e).pipe(Effect.andThen(Effect.fail(null)));
					}),
					run,
					Effect.runPromise,
				);
			});
		},
	};

	return plugin;
});

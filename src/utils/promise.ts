import * as Effect from "effect/Effect";

export function effectify<TArgs extends unknown[], TReturn, E>(
	run: (...args: TArgs) => PromiseLike<TReturn> | TReturn,
	mapError: (error: unknown) => E,
) {
	return function execute(...args: TArgs) {
		return Effect.tryPromise({
			async try() {
				return run(...args);
			},
			catch(error) {
				return mapError(error);
			},
		});
	};
}

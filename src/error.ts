import * as Predicate from "effect/Predicate";

export function asError(error: unknown): Error {
	if (error instanceof Error) {
		return error;
	}

	if (Predicate.hasProperty(error, "message")) {
		return new Error(JSON.stringify(error.message), { cause: error });
	}

	return new Error(JSON.stringify(error), { cause: error });
}

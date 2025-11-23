import * as Command from "@effect/platform/Command";
import type * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Fn from "effect/Function";
import * as Stream from "effect/Stream";

export class CommandError extends Data.TaggedError("CommandError")<{
	readonly exitCode: CommandExecutor.ExitCode;
}> {
	override readonly message = `Exited with code ${this.exitCode}`;
}

export const executeCommand = Fn.flow(
	Command.start,
	Effect.flatMap((process) => {
		const decoder = new TextDecoder();

		const logger = process.stdout.pipe(
			Stream.map((chunk) => decoder.decode(chunk)),
			Stream.mapEffect(Effect.logInfo),
			Stream.merge(
				process.stderr.pipe(
					Stream.map((chunk) => decoder.decode(chunk)),
					Stream.mapEffect(Effect.logError),
				),
			),
			Stream.runDrain,
			Effect.fork,
		);

		return Effect.zipLeft(process.exitCode, logger, { concurrent: true });
	}),
	Effect.flatMap((exitCode) => {
		if (exitCode !== 0) {
			return new CommandError({ exitCode });
		}

		return Effect.void;
	}),
);

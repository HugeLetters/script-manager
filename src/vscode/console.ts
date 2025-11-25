import { Console as NodeConsole } from "node:console";
import { Writable } from "node:stream";
import { type InspectOptions, inspect } from "node:util";
import { pipe } from "effect";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";
import { type OutputChannel as VsOutputChannel, window } from "vscode";
import { ConsoleUtils } from "$/utils/console";

export const MainOutputChannel = window.createOutputChannel("Script Manager");

export class OutputChannel extends Effect.Service<OutputChannel>()(
	"script-manager/logger/OutputChannel",
	{ succeed: MainOutputChannel },
) {}

function createConsole(write: (message: string) => void) {
	const stream = new Writable({
		write(chunk, _, callback) {
			if (chunk instanceof Buffer) {
				write(chunk.toString());
				return callback(null);
			}

			write(format(chunk));
			return callback(null);
		},
	});

	return new NodeConsole(stream);
}

function outputChannelConsole(channel: VsOutputChannel): Console.UnsafeConsole {
	const console = createConsole((message) => channel.append(message));
	return {
		...console,
		clear() {
			channel.clear();
		},
	};
}

export const VsConsoleLive = OutputChannel.pipe(
	Effect.map((channel) =>
		pipe(
			channel,
			outputChannelConsole,
			ConsoleUtils.fromUnsafe,
			Console.setConsole,
		),
	),
	Layer.unwrapEffect,
);

function format(value: unknown) {
	if (Predicate.isString(value)) {
		return value;
	}

	return inspect(value, DefaultInspectOptions);
}

const DefaultInspectOptions: InspectOptions = {
	depth: 5,
	numericSeparator: true,
	sorted: true,
};

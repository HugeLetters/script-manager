import { Console as NodeConsole } from "node:console";
import { Writable } from "node:stream";
import { type InspectOptions, inspect } from "node:util";
import { pipe } from "effect";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";
import { type OutputChannel as VscodeOutputChannel, window } from "vscode";

export class OutputChannel extends Effect.Service<OutputChannel>()(
	"script-manager/logger/OutputChannel",
	{ succeed: window.createOutputChannel("Script Manager") },
) {}

function outputChannelConsole(
	channel: VscodeOutputChannel,
): Console.UnsafeConsole {
	const stream = new Writable({
		write(chunk, _, callback) {
			if (chunk instanceof Buffer) {
				channel.append(chunk.toString());
				return callback(null);
			}

			channel.append(format(chunk));
			return callback(null);
		},
	});

	return {
		...new NodeConsole(stream),
		clear() {
			channel.clear();
		},
	};
}

function fromUnsafe(unsafe: Console.UnsafeConsole): Console.Console {
	return {
		unsafe,
		assert(condition, ...args) {
			return Effect.sync(() => unsafe.assert(condition, ...args));
		},
		count(label) {
			return Effect.sync(() => unsafe.count(label));
		},
		countReset(label) {
			return Effect.sync(() => unsafe.countReset(label));
		},
		debug(...args) {
			return Effect.sync(() => unsafe.debug(...args));
		},
		dir(item, options) {
			return Effect.sync(() => unsafe.dir(item, options));
		},
		dirxml(...args) {
			return Effect.sync(() => unsafe.dirxml(...args));
		},
		error(...args) {
			return Effect.sync(() => unsafe.error(...args));
		},
		group(opts) {
			if (opts?.collapsed) {
				return Effect.sync(() => unsafe.groupCollapsed(opts.label));
			}
			return Effect.sync(() => unsafe.group(opts?.label));
		},
		groupEnd: Effect.sync(() => unsafe.groupEnd()),
		info(...args) {
			return Effect.sync(() => unsafe.info(...args));
		},
		log(...args) {
			return Effect.sync(() => unsafe.log(...args));
		},
		table(tabularData, properties) {
			return Effect.sync(() => unsafe.table(tabularData, properties));
		},
		time(label) {
			return Effect.sync(() => unsafe.time(label));
		},
		timeLog(label, ...args) {
			return Effect.sync(() => unsafe.timeLog(label, ...args));
		},
		timeEnd(label) {
			return Effect.sync(() => unsafe.timeEnd(label));
		},
		trace(...args) {
			return Effect.sync(() => unsafe.trace(...args));
		},
		warn(...args) {
			return Effect.sync(() => unsafe.warn(...args));
		},
		clear: Effect.sync(() => unsafe.clear()),
		[Console.TypeId]: Console.TypeId,
	};
}

export const VscodeConsoleLive = OutputChannel.pipe(
	Effect.map((channel) =>
		pipe(channel, outputChannelConsole, fromUnsafe, Console.setConsole),
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

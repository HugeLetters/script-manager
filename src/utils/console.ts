import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Fn from "effect/Function";

export namespace ConsoleUtils {
	export function fromUnsafe(unsafe: Console.UnsafeConsole): Console.Console {
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

	export const noop: Console.UnsafeConsole = {
		assert: Fn.constVoid,
		count: Fn.constVoid,
		countReset: Fn.constVoid,
		debug: Fn.constVoid,
		dir: Fn.constVoid,
		dirxml: Fn.constVoid,
		error: Fn.constVoid,
		groupCollapsed: Fn.constVoid,
		group: Fn.constVoid,
		groupEnd: Fn.constVoid,
		info: Fn.constVoid,
		log: Fn.constVoid,
		table: Fn.constVoid,
		time: Fn.constVoid,
		timeLog: Fn.constVoid,
		timeEnd: Fn.constVoid,
		trace: Fn.constVoid,
		warn: Fn.constVoid,
		clear: Fn.constVoid,
	};
}

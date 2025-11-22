import { inspect } from "node:util";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type OutputChannel, window } from "vscode";

export class OutputChannelService extends Effect.Service<OutputChannelService>()(
	"script-manager/logger/OutputChannelService",
	{ succeed: window.createOutputChannel("Script Manager") },
) {}

export class VscodeConsole implements Console.Console {
	constructor(private readonly channel: OutputChannel) {}

	readonly unsafe: Console.Console["unsafe"] = {
		assert: (condition, ...args) => {},
		clear: () => {},
		count: (label) => {},
		debug: (...args) => {},
		countReset: (label) => {},
		dir: (item, options) => {},
		dirxml: (...args) => {},
		error: (...args) => {},
		group: (...args) => {},
		groupCollapsed: (...args) => {},
		groupEnd: () => {},
		info: (...args) => {
			this.channel.appendLine(
				args.map((s) => inspect(s, { colors: true })).join(" "),
			);
		},
		log: (...args) => {
			this.channel.appendLine(args.join(" "));
		},
		table: (tabularData, properties) => {},
		time: (label) => {},
		timeEnd: (label) => {},
		timeLog: (label, ...args) => {},
		trace: (...args) => {},
		warn: (...args) => {},
	};

	assert = effectify(this.unsafe.assert);
	count = effectify(this.unsafe.count);
	countReset = effectify(this.unsafe.countReset);
	debug = effectify(this.unsafe.debug);
	dir = effectify(this.unsafe.dir);
	dirxml = effectify(this.unsafe.dirxml);
	error = effectify(this.unsafe.error);
	group = effectify(this.unsafe.group);
	groupEnd = Effect.sync(() => this.unsafe.groupEnd());
	info = effectify(this.unsafe.info);
	log = effectify(this.unsafe.log);
	table = effectify(this.unsafe.table);
	time = effectify(this.unsafe.time);
	timeEnd = effectify(this.unsafe.timeEnd);
	timeLog = effectify(this.unsafe.timeLog);
	trace = effectify(this.unsafe.trace);
	warn = effectify(this.unsafe.warn);
	clear = Effect.sync(() => this.unsafe.clear());

	[Console.TypeId]: Console.Console[Console.TypeId] = Console.TypeId;
}

function effectify<Args extends unknown[], R>(method: (...args: Args) => R) {
	return (...args: Args) => {
		return Effect.sync(() => method(...args));
	};
}

export const VscodeConsoleLive = OutputChannelService.pipe(
	Effect.map((channel) => new VscodeConsole(channel)),
	Effect.map((console) => Console.setConsole(console)),
	Layer.unwrapEffect,
);

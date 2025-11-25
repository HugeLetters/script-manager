import { Command, Options } from "@effect/cli";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { argv } from "bun";
import * as Effect from "effect/Effect";
import * as Fn from "effect/Function";
import { Build } from "../build";

const build = Command.make(
	"build",
	{
		watch: Options.boolean("watch"),
		release: Options.boolean("release"),
	},
	({ watch, release }) => Build({ watch, release }),
);

build.pipe(
	Command.run({
		name: "Build CLI",
		version: "v1.0.0",
	}),
	Fn.apply(argv),
	Effect.provide([BunContext.layer]),
	Effect.scoped,
	BunRuntime.runMain,
);

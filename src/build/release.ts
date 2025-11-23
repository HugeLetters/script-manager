import * as Command from "@effect/platform/Command";
import * as FileSystem from "@effect/platform/FileSystem";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import { executeCommand } from "$/utils/shell/command";

const Package = Effect.fn(function* (extension: string) {
	const cmd = Command.make("bun", "run", "package", "--out", extension);
	yield* executeCommand(cmd);
});

const Install = Effect.fn(function* (extension: string) {
	const cmd = Command.make("code", "--install-extension", extension);
	yield* executeCommand(cmd);
});

Effect.gen(function* () {
	const now = yield* DateTime.now;
	const extension = `.extension-${now.epochMillis}.vsix`;

	yield* Package(extension);
	yield* Install(extension);

	const fs = yield* FileSystem.FileSystem;
	yield* fs.remove(extension);
}).pipe(Effect.provide(BunContext.layer), Effect.scoped, BunRuntime.runMain);

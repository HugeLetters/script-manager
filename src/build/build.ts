import * as FileSystem from "@effect/platform/FileSystem";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { argv } from "bun";
import * as Effect from "effect/Effect";
import { context, type Plugin } from "esbuild";

// todo - fully build and package extension, generate packge.json fields

const production = argv.includes("--production");
const watch = argv.includes("--watch");

const ProblemMatcherPlugin: Plugin = {
	name: "problem-matcher",
	setup(build) {
		build.onStart(() => {
			console.log("[watch] build started");
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				if (location) {
					console.error(
						`    ${location.file}:${location.line}:${location.column}:`,
					);
				}
			});

			console.log("[watch] build finished");
		});
	},
};

Effect.gen(function* () {
	const ctx = yield* Effect.tryPromise(() =>
		context({
			entryPoints: ["src/index.ts"],
			bundle: true,
			format: "cjs",
			minify: production,
			sourcemap: !production,
			sourcesContent: false,
			platform: "node",
			outfile: "dist/index.js",
			external: ["vscode"],
			logLevel: "info",
			plugins: [ProblemMatcherPlugin],
		}),
	);

	if (watch) {
		yield* Effect.tryPromise(() => ctx.watch());
		return;
	}

	const fs = yield* FileSystem.FileSystem;
	yield* fs.remove("dist", { force: true, recursive: true });

	yield* Effect.tryPromise(() => ctx.rebuild());
	yield* Effect.tryPromise(() => ctx.dispose());
}).pipe(Effect.provide([BunContext.layer]), BunRuntime.runMain);

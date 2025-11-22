import { argv } from "bun";
import type { Plugin } from "esbuild";
import { context } from "esbuild";

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

async function main() {
	const ctx = await context({
		entryPoints: ["src/index.ts"],
		bundle: true,
		format: "cjs",
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: "node",
		outfile: "dist/index.cjs",
		external: ["vscode"],
		logLevel: "info",
		plugins: [ProblemMatcherPlugin],
	});

	if (watch) {
		await ctx.watch();
		return;
	}

	await ctx.rebuild();
	await ctx.dispose();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});

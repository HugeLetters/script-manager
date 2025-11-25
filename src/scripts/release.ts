import * as Command from "@effect/platform/Command";
import * as FileSystem from "@effect/platform/FileSystem";
import { pipe } from "effect";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { Shell } from "$/utils/shell";
import { ExtractCommandDeclaration } from "./command-declaration";
import { PackageJson } from "./package-json";

const UpdatePackageJson = Effect.gen(function* () {
	yield* Effect.logInfo("Updating package.json");

	const fs = yield* FileSystem.FileSystem;

	const PackageJsonContent = yield* fs
		.readFileString("package.json")
		.pipe(Effect.flatMap(Schema.decode(PackageJson)));

	const commands = yield* ExtractCommandDeclaration;

	yield* Effect.log(
		"Declared commands",
		commands.map((command) => command.title),
	);

	yield* pipe(
		PackageJsonContent,
		(file): PackageJson => {
			return {
				...file,
				contributes: {
					...file.contributes,
					commands: [...commands],
				},
			};
		},
		Schema.encode(PackageJson),
		Effect.flatMap((f) => fs.writeFileString("package.json", f)),
	);

	yield* pipe(
		Command.make("bun", "run", "format", "package.json"),
		Shell.execute,
		Effect.catchAll((err) =>
			Effect.logWarning("Failed to format package.json", err),
		),
	);
});

const Package = Effect.fn(function* (extension: string) {
	yield* Effect.log("Packaging extension");
	const cmd = Command.make("bun", "run", "package", "--out", extension);
	yield* Shell.execute(cmd);
});

const Install = Effect.fn(function* (extension: string) {
	const cmd = Command.make("code", "--install-extension", extension);
	yield* Shell.execute(cmd);
});

export namespace Release {
	export const Prebuild = UpdatePackageJson;
	export const Postbuild = Effect.gen(function* () {
		const now = yield* DateTime.now;
		const extension = `.extension-${now.epochMillis}.vsix`;

		yield* Package(extension);
		yield* Install(extension);

		const fs = yield* FileSystem.FileSystem;
		yield* fs.remove(extension);
		yield* Effect.log("Removing extension file");
	});

	export const Full = Effect.gen(function* () {
		yield* Prebuild;
		yield* Postbuild;
	});
}

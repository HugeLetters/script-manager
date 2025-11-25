import * as Path from "@effect/platform/Path";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { type Node, Project } from "ts-morph";
import { asError } from "$/utils/error";

interface TsMorphLiveConfig {
	/** @private */
	readonly project: Project;
}

export class TsMorph extends Effect.Service<TsMorph>()(
	"script-manager/tsmorph/TsMorph",
	{
		effect: Effect.gen(function* () {
			yield* Effect.log("Initializing ts-morph service");

			const path = yield* Path.Path;

			const tsConfig = path.resolve(
				import.meta.dir,
				"..",
				"..",
				"tsconfig.json",
			);
			const project = yield* Effect.try({
				try() {
					return new Project({
						tsConfigFilePath: tsConfig,
					});
				},
				catch(error) {
					return new TsMorphError({ error });
				},
			});

			const result: TsMorphLiveConfig = { project };
			return result;
		}),
	},
) {
	use = Effect.fn(<T>(run: (project: Project) => PromiseLike<T> | T) => {
		return Effect.tryPromise({
			try: async () => {
				return run(this.project);
			},
			catch(error) {
				return new TsMorphError({ error });
			},
		});
	});

	addSourceFile = Effect.fn((filePath: string) => {
		return this.use((project) => {
			return project.addSourceFileAtPath(filePath);
		});
	});
}

export namespace TsMorph {
	export function getNodeName(node: Node) {
		return node.getSymbol()?.getName() ?? node.getText();
	}

	export function getNodeLocation(node: Node) {
		const source = node.getSourceFile();
		const position = source.getLineAndColumnAtPos(node.getStart());
		return `${source.getFilePath()}:${position.line}:${position.column}`;
	}
}

export class TsMorphError extends Data.TaggedError("TsMorphError")<{
	error: unknown;
}> {
	override cause = asError(this.error);
	override message = this.cause.message;
}

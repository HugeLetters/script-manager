import * as Path from "@effect/platform/Path";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { type SimpleGit, simpleGit } from "simple-git";
import { TextEditorService } from "./editor";
import { asError } from "./error";

interface GitLiveConfig {
	/** @private */
	readonly service: SimpleGit;
}

export class GitService extends Effect.Service<GitService>()(
	"script-manager/git/GitService",
	{
		effect: Effect.gen(function* () {
			const editor = yield* TextEditorService;
			const path = yield* Path.Path;

			const currentUri = editor.service.document.uri;
			const dirname = path.dirname(currentUri.fsPath);

			const service = yield* Effect.try({
				try() {
					return simpleGit({ baseDir: dirname });
				},
				catch(error) {
					return new GitError({ error });
				},
			});
			const result: GitLiveConfig = { service };
			return result;
		}),
	},
) {
	use = Effect.fn(<T>(run: (git: SimpleGit) => PromiseLike<T> | T) => {
		return Effect.tryPromise({
			try: async () => {
				return run(this.service);
			},
			catch(error) {
				return new GitError({ error });
			},
		});
	});

	branch = this.use((git) => git.branch()).pipe(Effect.option);
}

export class GitError extends Data.TaggedError("GitError")<{
	error: unknown;
}> {
	override cause = asError(this.error);
	override message = this.cause.message;
}

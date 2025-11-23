import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { type SimpleGit, simpleGit } from "simple-git";
import { asError } from "../utils/error";
import { CurrentDirectory } from "./directory";

interface GitLiveConfig {
	/** @private */
	readonly service: SimpleGit;
}

export class Git extends Effect.Service<Git>()("script-manager/git/Git", {
	effect: Effect.gen(function* () {
		const dirname = yield* CurrentDirectory;
		yield* Effect.log("Initiating git service", { dirname });

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
}) {
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

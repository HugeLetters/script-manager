import * as Config from "effect/Config";

export const CommandPrefix = Config.string("command-prefix").pipe(
	Config.withDefault("script-manager"),
);

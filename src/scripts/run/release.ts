import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TsMorph } from "../../service/tsmorph";
import { Build } from "../build";
import { Release } from "../release";

Build({
	release: false,
	watch: false,
}).pipe(
	Effect.andThen(Release.Full),
	Effect.provide([Layer.provideMerge(TsMorph.Default, BunContext.layer)]),
	Effect.scoped,
	BunRuntime.runMain,
);

import { pipe } from "effect";
import * as Arr from "effect/Array";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Str from "effect/String";

namespace Str_ {
	export function template(
		template: TemplateStringsArray,
		...chunks: ReadonlyArray<string | null>
	) {
		return pipe(
			chunks,
			Arr.zipWith(template, (chunk, template) =>
				Predicate.isNotNullable(chunk) ? `${template}${chunk}` : template,
			),
			Arr.join(""),
			Str.concat(Arr.last(template).pipe(Option.getOrElse(() => ""))),
		);
	}
}

export { Str_ as Str };

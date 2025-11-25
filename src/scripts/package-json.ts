import * as Schema from "effect/Schema";

function looseStruct<Fields extends Schema.Struct.Fields>(fields: Fields) {
	return Schema.Struct(fields).pipe(
		Schema.annotations({ parseOptions: { onExcessProperty: "preserve" } }),
	);
}

const CommandDeclaration = looseStruct({
	command: Schema.String,
	title: Schema.String,
	enablement: Schema.String.pipe(Schema.optional),
}).pipe(Schema.annotations({ identifier: "Command" }));

export type CommandDeclaration = typeof CommandDeclaration.Type;

const PackageJsonFromSelf = looseStruct({
	contributes: looseStruct({
		commands: Schema.Array(CommandDeclaration),
	}).pipe(Schema.annotations({ identifier: "Contributes" })),
});

export const PackageJson = Schema.parseJson(PackageJsonFromSelf).pipe(
	Schema.annotations({ identifier: "PackageJson" }),
);
export type PackageJson = typeof PackageJson.Type;

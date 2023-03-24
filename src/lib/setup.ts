import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-i18next/register";
import {
	ApplicationCommandRegistries,
	RegisterBehavior,
} from "@sapphire/framework";
import { inspect } from "node:util";
import { registerFont } from "canvas";
import { readdirSync } from "node:fs";
import { mainFolder } from "./util";
import { join } from "node:path";

process.env.NODE_ENV ??= "development";

inspect.defaultOptions.depth = 1;

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
	RegisterBehavior.BulkOverwrite
);

const fontDir = join(mainFolder, "fonts");
const fontFiles = readdirSync(fontDir);
fontFiles.forEach((fontFile) => {
	const fontName = fontFile.substring(0, fontFile.indexOf("."));
	registerFont(join(fontDir, fontFile), { family: fontName });
	console.log(join(fontDir, fontFile), fontName);
});

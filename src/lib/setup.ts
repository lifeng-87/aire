import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-i18next/register";
import { inspect } from "node:util";
import { GlobalFonts } from "@napi-rs/canvas";
import { join } from "node:path";
import { mainFolder } from "./util";

process.env.NODE_ENV ??= "development";

inspect.defaultOptions.depth = 1;

GlobalFonts.registerFromPath(
	join(mainFolder, "fonts", "NotoSansTC-Black.otf"),
	"NotoSansTC"
);

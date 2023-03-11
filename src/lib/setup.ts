import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-i18next/register";
import { inspect } from "node:util";

process.env.NODE_ENV ??= "development";

inspect.defaultOptions.depth = 1;

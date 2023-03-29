import { config } from "#root/config";
import { CustomGet } from "#root/lib/types";
import { second } from "#root/lib/util";
import { Command, PieceContext } from "@sapphire/framework";
import { CacheType } from "discord.js";

export class AireCommand extends Command {
	public readonly name: CustomGet<string, string>;
	public readonly description: CustomGet<string, string>;

	public constructor(context: PieceContext, options: AireCommand.Options) {
		super(context, {
			cooldownDelay: second(5),
			cooldownLimit: 2,
			cooldownFilteredUsers: config.discord.owners,
			...options,
		});

		this.name = options.name;
		this.description = options.description;
	}
}

export namespace AireCommand {
	export type Options = Command.Options & {
		name: CustomGet<string, string>;
		description: CustomGet<string, string>;
	};
	export type JSON = Command.JSON;
	export type Context = Command.Context;
	export type RunInTypes = Command.RunInTypes;
	export type ChatInputCommandInteraction<
		Cached extends CacheType = CacheType
	> = Command.ChatInputCommandInteraction<Cached>;
	export type ContextMenuCommandInteraction<
		Cached extends CacheType = CacheType
	> = Command.ContextMenuCommandInteraction<Cached>;
	export type AutocompleteInteraction<Cached extends CacheType = CacheType> =
		Command.AutocompleteInteraction<Cached>;
	export type Registry = Command.Registry;
}

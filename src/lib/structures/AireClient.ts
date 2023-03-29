import { SapphireClient } from "@sapphire/framework";
import { config } from "#root/config";
import { Player } from "discord-player";
import * as Utils from "../util";
import { YouTubeExtractor } from "@discord-player/extractor";
import { InternationalizationContext } from "@sapphire/plugin-i18next";

export class AireClient extends SapphireClient {
	public player: Player;
	public utils: typeof Utils;
	public constructor() {
		super({
			...config.discord.options,
			i18n: {
				fetchLanguage: async (context: InternationalizationContext) => {
					/*	if (context.interactionGuildLocale || context.interactionLocale) {
						return (context.interactionGuildLocale ||
							context.interactionLocale)!;
					}*/

					if (!context.guild) {
						return "zh-TW";
					}

					return "zh-TW";
				},
			},
		});
		this.player = Player.singleton(this);
		void this.player.extractors.register(YouTubeExtractor);
		this.utils = Utils;
	}

	public async login() {
		this.logger.info("Connecting to Discord...");
		return super.login(config.discord.token);
	}

	public destroy() {
		void this.player.destroy();
		return super.destroy();
	}
}

declare module "discord.js" {
	export interface Client {
		readonly player: Player;
		readonly utils: typeof Utils;
	}
}

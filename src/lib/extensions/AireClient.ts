import { SapphireClient } from "@sapphire/framework";
import { config } from "#root/config";
import { Player } from "discord-player";
import * as Utils from "../util";
import { YouTubeExtractor } from "@discord-player/extractor";

export class AireClient extends SapphireClient {
  public player: Player;
  public utils: typeof Utils;
  public constructor() {
    super(config.discord.options);
    this.player = Player.singleton(this);
    this.player.extractors.register(YouTubeExtractor);
    this.utils = Utils;
  }

  public async fetchLanguage() {}

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

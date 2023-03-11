import {
  ApplicationCommandRegistries,
  BucketScope,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";
import { envParseArray, envParseString } from "@skyra/env-utilities";
import { GatewayIntentBits } from "discord.js";
import { second } from "#utils/common";
import { join } from "path";
import { setup } from "@skyra/env-utilities";
import { mainFolder } from "#utils/constants";
import type { Config } from "#lib/types/Config";

setup({ path: join(mainFolder, ".env") });

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite
);

const ownersId = envParseArray("OWNERS_ID");
const discordToken = envParseString("DISCORD_TOKEN");
const discordBotId = Buffer.from(
  discordToken.split(".")[0],
  "base64"
).toString();

export const config: Config = {
  isDev: process.env.NODE_ENV != "production",
  discord: {
    owners: ownersId,
    token: discordToken,
    id: discordBotId,
    devServer: envParseArray("DEV_GUILDS_ID"),
    options: {
      disableMentionPrefix: true,
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
      defaultCooldown: {
        filteredUsers: ownersId,
        scope: BucketScope.User,
        delay: second(10),
        limit: 2,
      },
      logger: {
        level:
          envParseString("NODE_ENV") === "production"
            ? LogLevel.Info
            : LogLevel.Debug,
      },
    },
  },
};

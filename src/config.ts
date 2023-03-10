import { BucketScope, LogLevel } from "@sapphire/framework";
import { envParseArray, envParseString } from "@skyra/env-utilities";
import { ClientOptions, GatewayIntentBits } from "discord.js";
import { second } from "#utils/common";
import { join } from "path";
import { setup } from "@skyra/env-utilities";
import { mainFolder } from "#utils/constants";

setup({ path: join(mainFolder, ".env") });

export const OWNERS_ID = envParseArray("OWNERS_ID");

export const CLIENT_OPTIONS: ClientOptions = {
  disableMentionPrefix: true,
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  defaultCooldown: {
    filteredUsers: OWNERS_ID,
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
};

export const DISCORD_TOKEN = envParseString("DISCORD_TOKEN");

export const BOT_ID = Buffer.from(
  DISCORD_TOKEN.split(".")[0],
  "base64"
).toString();

export const DEV_GUILD_ID = envParseString("DEV_GUILD_ID");

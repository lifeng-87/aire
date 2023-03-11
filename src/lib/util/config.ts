import { config } from "#root/config";

export function getDevGuildId() {
  return config.isDev ? config.discord.devServer : undefined;
}

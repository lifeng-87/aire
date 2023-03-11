import { ClientOptions } from "discord.js";

export interface Config {
  isDev: boolean;
  discord: {
    owners: string[];
    token: string;
    id: string;
    devServer: string[];
    options: ClientOptions;
  };
}

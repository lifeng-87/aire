import { Message, TextChannel } from "discord.js";

export interface Metadata {
  message: Message;
  channel: TextChannel;
}

import { InteractionResponse, Message, TextChannel } from "discord.js";

export interface Metadata {
  message: Message | InteractionResponse;
  channel: TextChannel;
}

import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Message,
} from "discord.js";

export interface Metadata {
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
  message: Message;
}

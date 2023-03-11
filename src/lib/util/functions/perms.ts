import { isGuildMember } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  PermissionsBitField,
} from "discord.js";

export function voice(
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
) {
  const { member } = interaction;

  if (!isGuildMember(member))
    throw container.logger.error("is not GuildMember");

  const resolved = new PermissionsBitField([
    PermissionsBitField.Flags.Connect,
    PermissionsBitField.Flags.Speak,
    PermissionsBitField.Flags.ViewChannel,
  ]);

  const missingPerms = member.voice.channel
    ?.permissionsFor(interaction.guild?.members.me!)
    .missing(resolved);
  if (missingPerms?.length) {
    return `I am **missing** the required voice channel permissions: \`${missingPerms.join(
      ", "
    )}\``;
  }

  if (!member.voice.channel) return `You **need** to be in a voice channel.`;

  if (
    interaction.guild?.members.me?.voice.channelId &&
    member.voice.channelId !== interaction.guild?.members.me?.voice.channelId
  ) {
    return `You are **not** in my voice channel`;
  }

  return member;
}

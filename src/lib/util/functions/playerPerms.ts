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

  const checkClient = (): boolean => {
    const resolved = new PermissionsBitField([
      PermissionsBitField.Flags.Connect,
      PermissionsBitField.Flags.Speak,
      PermissionsBitField.Flags.ViewChannel,
    ]);

    const missingPerms = member.voice.channel
      ?.permissionsFor(interaction.guild?.members.me!)
      .missing(resolved);
    if (missingPerms?.length) {
      const content = `I am **missing** the required voice channel permissions: \`${missingPerms.join(
        ", "
      )}\``;

      if (interaction.deferred) {
        interaction.editReply({
          content,
        });
      } else {
        interaction.reply({
          content,
          ephemeral: true,
        });
      }

      return false;
    }

    return true;
  };

  const checkMember = (): boolean => {
    if (!member.voice.channel) {
      const content = `You **need** to be in a voice channel.`;
      if (interaction.deferred) {
        interaction.editReply({ content });
      } else {
        interaction.reply({ content, ephemeral: true });
      }
      return false;
    }
    return true;
  };

  const checkClientToMember = (): boolean => {
    if (
      interaction.guild?.members.me?.voice.channelId &&
      member.voice.channelId !== interaction.guild?.members.me?.voice.channelId
    ) {
      const content = `You are **not** in my voice channel`;
      if (interaction.deferred) {
        interaction.editReply({ content });
      } else {
        interaction.reply({ content, ephemeral: true });
      }

      return false;
    }

    return true;
  };

  return { checkClient, checkClientToMember, checkMember };
}

import { getDevGuildId } from "#utils/config";
import { Command } from "@sapphire/framework";
import { useQueue } from "discord-player";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: "Changes the volume of the track and entire queue",
    });
  }

  public override async registerApplicationCommands(
    registry: Command.Registry
  ) {
    registry.registerChatInputCommand(
      (command) =>
        command
          .setName(this.name)
          .setDescription(this.description)
          .addIntegerOption((opt) =>
            opt
              .setName("amount")
              .setDescription("The amount of volume you want to change to")
              .setMaxValue(100)
              .setMinValue(0)
          ),
      { guildIds: getDevGuildId() }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { voice } = this.container.client.utils;
    const queue = useQueue(interaction.guildId!);
    const permissions = voice(interaction);
    const volume = interaction.options.getInteger("amount");

    if (!queue)
      return interaction.reply({
        content: `I am not in a voice channel`,
        ephemeral: true,
      });

    if (!permissions.checkClientToMember()) return;

    if (!queue.currentTrack)
      return interaction.reply({
        content: `There is no track **currently** playing`,
        ephemeral: true,
      });

    if (!volume)
      return interaction.reply({
        content: `🔊 | **Current** volume is **${queue?.node.volume}%**`,
      });

    queue?.node.setVolume(volume);
    return interaction.reply({
      content: `🔊 | I **changed** the volume to: **${queue?.node.volume}%**`,
    });
  }
}

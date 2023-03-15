import { voice } from "#utils/functions";
import { Command } from "@sapphire/framework";
import { useQueue } from "discord-player";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override async registerApplicationCommands(
    registry: Command.Registry
  ) {
    registry.registerChatInputCommand((command) =>
      command
        .setName("volume")
        .setDescription("Changes the volume of the track and entire queue")
        .addIntegerOption((opt) =>
          opt
            .setName("amount")
            .setDescription("The amount of volume you want to change to")
            .setMaxValue(100)
            .setMinValue(0)
        )
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const queue = useQueue(interaction.guildId!);
    const permissions = voice(interaction);
    const volume = interaction.options.getInteger("amount");

    if (!queue)
      return interaction.reply({
        content: `I am not in a voice channel`,
        ephemeral: true,
      });
    if (!queue.currentTrack)
      return interaction.reply({
        content: `There is no track **currently** playing`,
        ephemeral: true,
      });

    if (!volume)
      return interaction.reply({
        content: `🔊 | **Current** volume is **${queue?.node.volume}%**`,
      });

    if (permissions.checkClientToMember()) return;

    queue?.node.setVolume(volume);
    return interaction.reply({
      content: `I **changed** the volume to: **${queue?.node.volume}%**`,
    });
  }
}

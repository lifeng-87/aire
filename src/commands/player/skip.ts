import { getDevGuildId } from "#utils/config";
import { Command } from "@sapphire/framework";
import { useQueue } from "discord-player";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: "Skips the current track and automatically plays the next",
    });
  }

  public override async registerApplicationCommands(
    registry: Command.Registry
  ) {
    registry.registerChatInputCommand(
      (command) => command.setName(this.name).setDescription(this.description),
      { guildIds: getDevGuildId() }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { voice, Emojis, createPlayerUI } = this.container.client.utils;
    const permissions = voice(interaction);

    const queue = useQueue(interaction.guildId!);
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

    queue.node.skip();

    await createPlayerUI(interaction.guildId!);
    return interaction.reply({
      content: `${Emojis.Skip} | I have **skipped** to the next track`,
    });
  }
}

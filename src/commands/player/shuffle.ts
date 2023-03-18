import { getDevGuildId } from "#utils/config";
import { Command } from "@sapphire/framework";
import { useQueue } from "discord-player";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override async registerApplicationCommands(
    registry: Command.Registry
  ) {
    registry.registerChatInputCommand(
      (command) => command.setName("shuffle").setDescription("shuffle"),
      { guildIds: getDevGuildId() }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const permissions = this.container.client.utils.voice(interaction);
    if (!permissions.checkClientToMember()) return;

    const queue = useQueue(interaction.guildId!);
    if (!queue)
      return interaction.reply({
        content: `I am **not** in a voice channel`,
        ephemeral: true,
      });
    if (queue.tracks.size < 2)
      return interaction.reply({
        content: `There are not **enough tracks** in queue to **shuffle**`,
        ephemeral: true,
      });

    queue.tracks.shuffle();
    return interaction.reply({
      content: `${this.container.client.utils.Emojis.Shuffle} | I have **shuffled** the queue`,
    });
  }
}

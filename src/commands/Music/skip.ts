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
      (command) => command.setName("skip").setDescription("skip"),
      { guildIds: getDevGuildId() }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const queue = useQueue(interaction.guildId!);

    queue?.node.skip();
    return interaction.reply({
      content: `⏩ | I have **skipped** to the next track`,
    });
  }
}

import { getDevGuildId } from "#utils/config";
import { Command } from "@sapphire/framework";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override async registerApplicationCommands(
    registry: Command.Registry
  ) {
    registry.registerChatInputCommand(
      (command) => command.setName("pause").setDescription("pause"),
      { guildIds: getDevGuildId() }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    return interaction;
  }
}

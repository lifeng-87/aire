import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ChatInputCommand, Command } from "@sapphire/framework";
import { ApplicationCommandType } from "discord.js";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName("ping")
        .setDescription("Ping bot to see if it is alive.")
    );

    registry.registerContextMenuCommand((builder) => {
      builder //
        .setName(this.name)
        .setType(ApplicationCommandType.Message);
    });

    registry.registerContextMenuCommand((builder) => {
      builder //
        .setName(this.name)
        .setType(ApplicationCommandType.User);
    });
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const msg = await interaction.reply({
      content: `Ping?`,
      ephemeral: true,
      fetchReply: true,
    });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(
        `The round trip took **${diff}ms** and the heartbeat being **${ping}ms**`
      );
    }

    return interaction.editReply("Failed to retrieve ping :(");
  }

  public async contextMenuRun(
    interaction: Command.ContextMenuCommandInteraction
  ) {
    const msg = await interaction.reply({ content: `Ping?`, fetchReply: true });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(
        `The round trip took **${diff}ms** and the heartbeat being **${ping}ms**`
      );
    }

    return interaction.editReply("Failed to retrieve ping...");
  }
}

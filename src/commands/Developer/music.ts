import { Subcommand } from "@sapphire/plugin-subcommands";

export class UserCommand extends Subcommand {
  public constructor(context: Subcommand.Context, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: "play",
      subcommands: [
        { name: "play", chatInputRun: "chatInputPlay" },
        { name: "volume", chatInputRun: "chatInputVolume" },
      ],
    });
  }

  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("music")
        .setDescription("test")
        .addSubcommand((command) =>
          command.setName("play").setDescription("play")
        )
        .addSubcommand((command) =>
          command.setName("volume").setDescription("volume")
        )
    );
  }

  public async chatInputPlay(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    interaction.reply("play");
  }

  public async chatInputVolume(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    interaction.reply("volume");
  }
}

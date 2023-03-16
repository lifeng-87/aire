import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
} from "discord.js";
import { useQueue } from "discord-player";
import { Emojis } from "#root/lib/util/constants";

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "@aire/player-button.pause")
      return this.none();

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const queue = useQueue(interaction.guildId!);

    if (!queue) return interaction.deferUpdate();

    queue?.node.pause();

    const content = interaction.message.content;
    const embeds = interaction.message.embeds;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("@aire/player-button.resume")
        .setEmoji(Emojis.Play)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("@aire/player-button.skip")
        .setEmoji(Emojis.Skip)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("@aire/player-button.shuffle")
        .setEmoji(Emojis.Shuffle)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("@aire/player-button.repeat")
        .setLabel(["off", "track", "queue", "auto play"][queue?.repeatMode])
        .setEmoji(Emojis.Repeat)
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.message.edit({
      content,
      embeds,
      components: [row],
    });

    return interaction.deferUpdate();
  }
}

import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { useQueue } from "discord-player";

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "@aire/player-button.shuffle")
      return this.none();

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const queue = useQueue(interaction.guildId!);

    if (!queue) return interaction.deferUpdate();

    queue.tracks.shuffle();

    const content = interaction.message.content;
    const components = interaction.message.components;

    const next = queue.tracks.at(0);

    const embed = new EmbedBuilder()
      .setTitle(`${queue.currentTrack?.title}`)
      .setURL(queue.currentTrack?.url!)
      .setThumbnail(queue.currentTrack?.thumbnail!)
      .setDescription(
        `▶️ ${queue.node
          .createProgressBar({ queue: false })
          ?.replaceAll("┃", "")}`
      );

    if (next) {
      embed.addFields({
        name: "Next track",
        value: `[\`${next?.title}\`](${next?.url}) - ${next?.requestedBy}`,
      });
    }

    await interaction.message.edit({
      content,
      embeds: [embed],
      components,
    });

    return interaction.deferUpdate();
  }
}

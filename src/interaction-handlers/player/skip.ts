import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";
import { useQueue } from "discord-player";

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "@aire/player-button.skip") return this.none();

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const queue = useQueue(interaction.guildId!);

    if (!queue) return interaction.deferUpdate();

    queue?.node.skip();

    const content = interaction.message.content;
    const embeds = interaction.message.embeds;
    const components = interaction.message.components;

    await interaction.message.edit({
      content,
      embeds,
      components,
    });

    return interaction.deferUpdate();
  }
}

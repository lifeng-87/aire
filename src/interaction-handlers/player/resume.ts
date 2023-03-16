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
    if (interaction.customId !== "@aire/player-button.resume")
      return this.none();

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const permissions = this.container.client.utils.voice(interaction);
    if (!permissions.checkClientToMember()) return;

    const queue = useQueue(interaction.guildId!);

    if (!queue || !queue.currentTrack) return interaction.deferUpdate();

    queue.node.resume();

    const editData = this.container.client.utils.createPlayerUI(queue);

    await interaction.message.edit(editData);

    return interaction.deferUpdate();
  }
}

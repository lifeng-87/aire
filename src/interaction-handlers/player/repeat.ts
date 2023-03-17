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
    if (interaction.customId !== "@aire/player-button.repeat")
      return this.none();

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const permissions = this.container.client.utils.voice(interaction);
    if (!permissions.checkClientToMember()) return;

    const queue = useQueue(interaction.guildId!);

    if (!queue) return interaction.deferUpdate();

    queue.setRepeatMode(queue.repeatMode === 3 ? 0 : queue.repeatMode + 1);

    const editData = this.container.client.utils.createPlayerUI(queue);

    await interaction.message.edit(editData);

    return interaction.deferUpdate();
  }
}

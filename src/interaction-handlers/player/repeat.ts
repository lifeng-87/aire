import {
	InteractionHandler,
	InteractionHandlerTypes,
	PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";
import { useQueue } from "discord-player";
import type { QueueMetadata } from "#lib/types/GuildQueueMeta";

export class ButtonHandler extends InteractionHandler {
	public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button,
		});
	}

	public override parse(interaction: ButtonInteraction) {
		if (interaction.customId !== `@aire/player-button.${this.name}`)
			return this.none();

		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		const { voice, voiceButton, createPlayerUI } = this.container.client.utils;
		const voicePerms = voice(interaction);
		const btnPerms = voiceButton(interaction);

		if (!btnPerms.checkMessage()) return;
		if (!btnPerms.checkQueue()) return;

		const queue = useQueue<QueueMetadata>(interaction.guildId!);

		if (!voicePerms.checkMember()) return;
		if (!voicePerms.checkClientToMember()) return;

		queue?.setRepeatMode(queue.repeatMode === 3 ? 0 : queue.repeatMode + 1);

		const { embeds, components } = createPlayerUI(interaction.guildId!);

		await queue?.metadata?.message.edit({
			embeds: embeds(),
			components: components(),
		});

		return interaction.deferUpdate();
	}
}

import {
	InteractionHandler,
	InteractionHandlerTypes,
	PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, ButtonStyle, ComponentType } from "discord.js";
import { useQueue } from "discord-player";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";

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

		const queue = useQueue(interaction.guildId!);

		if (!voicePerms.checkMember()) return;
		if (!voicePerms.checkClientToMember()) return;

		if (!queue)
			return interaction.reply({
				content: `I am **not** in a voice channel`,
				ephemeral: true,
			});

		let pagesNum = Math.ceil(queue.tracks.size / 5);
		if (pagesNum <= 0) pagesNum = 1;

		const tracks = queue.tracks.map(
			(track, idx) =>
				`**${(++idx).toString().padStart(2, "0")})**\n[\`${track.title}\`](${
					track.url
				})\nRequested by: ${track.requestedBy}`
		);

		await interaction.deferReply({ ephemeral: true });
		const paginatedMessage = new PaginatedMessage();

		// handle error if pages exceed 25 pages
		if (pagesNum > 25) pagesNum = 25;
		for (let i = 0; i < pagesNum; i++) {
			const list = tracks.slice(i * 5, i * 5 + 5).join("\n");

			paginatedMessage.addPageEmbed((embed) => {
				embed
					.setColor("Red")
					.setTitle(`**Queue** for **session** in **${queue.channel?.name}:**`)
					.setThumbnail(queue.currentTrack!.thumbnail!)
					.setDescription(
						`${`**Now Playing**\n[${queue.currentTrack?.title}](${queue.currentTrack?.url}`})\nRequested by: ${
							queue.currentTrack?.requestedBy
						}`
					)
					.setFooter({
						text: `${queue.tracks.size} track(s) in queue`,
					});

				if (list !== "") {
					embed.addFields({
						name: "More tracks",
						value: `${list}`,
					});
				}

				return embed;
			});
		}

		paginatedMessage.setActions([
			{
				customId: "@aire/queue-messages.firstPage",
				style: ButtonStyle.Secondary,
				emoji: "⏪",
				type: ComponentType.Button,
				run: ({ handler }) => (handler.index = 0),
			},
			{
				customId: "@aire/queue-messages.previousPage",
				style: ButtonStyle.Secondary,
				emoji: "◀️",
				type: ComponentType.Button,
				run: ({ handler }) => {
					if (handler.index === 0) {
						handler.index = handler.pages.length - 1;
					} else {
						--handler.index;
					}
				},
			},
			{
				customId: "@aire/queue-messages.nextPage",
				style: ButtonStyle.Secondary,
				emoji: "▶️",
				type: ComponentType.Button,
				run: ({ handler }) => {
					if (handler.index === handler.pages.length - 1) {
						handler.index = 0;
					} else {
						++handler.index;
					}
				},
			},
			{
				customId: "@aire/queue-messages.goToLastPage",
				style: ButtonStyle.Secondary,
				emoji: "⏩",
				type: ComponentType.Button,
				run: ({ handler }) => (handler.index = handler.pages.length - 1),
			},
		]);

		await createPlayerUI(interaction.guildId!);

		return paginatedMessage.run(interaction);
	}
}

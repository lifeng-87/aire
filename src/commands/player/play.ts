import { Command } from "@sapphire/framework";
import { s } from "@sapphire/shapeshift";
import { useMasterPlayer } from "discord-player";
import { getDevGuildId } from "#utils/config";
import type { Metadata } from "#lib/types/GuildQueueMeta";
import { ThreadAutoArchiveDuration, type GuildMember } from "discord.js";

export class UserCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: "Plays and enqueues track(s) of the query provided",
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(command) =>
				command
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((opt) =>
						opt
							.setName("query")
							.setDescription("A query of your choice")
							.setRequired(true)
							.setAutocomplete(true)
					),
			{ guildIds: getDevGuildId() }
		);
	}

	public override async autocompleteRun(
		interaction: Command.AutocompleteInteraction
	) {
		const player = useMasterPlayer();
		const query = interaction.options.getString("query");
		const url = s.string.url();

		try {
			url.parse(query);
			return interaction.respond([]);
		} catch (error) {
			let results = await player!.search(query!);
			if (!results.hasTracks()) {
				results = await player!.search("#music", {
					searchEngine: "youtubeSearch",
				});
			}

			return interaction.respond(
				this.container.client.utils.createAutocomplateResult(
					results.tracks.slice(0, 25).map((t) => ({
						name: t.title,
						value: t.url,
					}))
				)
			);
		}
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { voice } = this.container.client.utils;
		const permissions = voice(interaction);
		const player = useMasterPlayer();
		const query = interaction.options.getString("query");

		if (!permissions.checkClient()) return;
		if (!permissions.checkMember()) return;
		if (!permissions.checkClientToMember()) return;

		const member = interaction.member as GuildMember;

		const results = (await player!.search(query!)).setRequestedBy(member.user);

		if (!results.hasTracks())
			return interaction.reply({
				content: `**No** tracks were found for your query`,
				ephemeral: true,
			});

		try {
			const queue = player?.queues.get<Metadata>(interaction.guildId!);

			if (!queue) {
				const threadMsg = await interaction.deferReply({
					fetchReply: true,
				});

				const thread = await threadMsg.startThread({
					name: "🎶 Player 🎶",
					autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
				});

				const message = await thread.send("🎶 **Now playing** 🎶");

				await player?.play(member.voice.channel!.id, results, {
					nodeOptions: {
						metadata: {
							channel: interaction.channel!,
							thread: thread!,
							message,
						},
						leaveOnEmptyCooldown: this.container.client.utils.second(30),
						leaveOnEmpty: true,
						leaveOnEnd: false,
						bufferingTimeout: 0,
						selfDeaf: true,
					},
				});

				return interaction.editReply({
					content: "🎶 **Player Start** 🎶",
				});
			}

			await player?.play(member.voice.channel!.id, results);

			return interaction
				.reply({
					content: `There has new treak(s) enqueued!`,
				})
				.then((interaction) =>
					setTimeout(
						() => interaction.delete(),
						this.container.client.utils.second(10)
					)
				);
		} catch (error) {
			await interaction.editReply({
				content: `An **error** has occurred`,
			});
			return this.container.logger.error(error);
		}
	}
}

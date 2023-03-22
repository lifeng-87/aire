import type { QueueMetadata } from "#lib/types/GuildQueueMeta";
import { getDevGuildId } from "#utils/config";
import { Command } from "@sapphire/framework";
import { useQueue } from "discord-player";

export class UserCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: "Pauses or resumes the current track",
		});
	}

	public override async registerApplicationCommands(
		registry: Command.Registry
	) {
		registry.registerChatInputCommand(
			(command) => command.setName(this.name).setDescription(this.description),
			{ guildIds: getDevGuildId() }
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { voice, createPlayerUI, second } = this.container.client.utils;
		const permissions = voice(interaction);
		const queue = useQueue<QueueMetadata>(interaction.guildId!);

		if (!queue)
			return interaction.reply({
				content: `I am not in a voice channel`,
				ephemeral: true,
			});

		if (!permissions.checkClientToMember()) return;

		if (!queue.currentTrack)
			return interaction.reply({
				content: `There is no track **currently** playing`,
				ephemeral: true,
			});

		if (queue.node.isPaused()) {
			queue.node.resume();
		} else {
			queue.node.pause();
		}

		const { embeds, components } = createPlayerUI(interaction.guildId!);

		await queue.metadata?.message.edit({
			embeds: embeds(),
			components: components(),
		});

		return interaction
			.reply({
				content: `${this.container.client.utils.Emojis.Stop} | I have **${
					queue.node.isPaused() ? "pause" : "resumed"
				}** the track`,
				fetchReply: true,
			})
			.then((msg) => setTimeout(() => msg.delete(), second(10)));
	}
}

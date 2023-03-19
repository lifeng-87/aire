import { getDevGuildId } from "#utils/config";
import { Command } from "@sapphire/framework";
import { QueueRepeatMode, useQueue } from "discord-player";

const repeatModes = [
	{ name: "Off", value: QueueRepeatMode.OFF },
	{ name: "Track", value: QueueRepeatMode.TRACK },
	{ name: "Queue", value: QueueRepeatMode.QUEUE },
	{ name: "Autoplay", value: QueueRepeatMode.AUTOPLAY },
];

export class LoopCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: "Loops the current playing track or the entire queue",
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(command) =>
				command
					.setName(this.name)
					.setDescription(this.description)
					.addNumberOption((option) =>
						option
							.setName("mode")
							.setDescription("Choose a loop mode")
							.setRequired(true)
							.addChoices(...repeatModes)
					),
			{ guildIds: getDevGuildId() }
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { voice, createPlayerUI, second } = this.container.client.utils;
		const queue = useQueue(interaction.guild!.id);
		const permissions = voice(interaction);

		if (!queue)
			return interaction.reply({
				content: `I am **not** in a voice channel`,
				ephemeral: true,
			});
		if (!queue.currentTrack)
			return interaction.reply({
				content: `There is no track **currently** playing`,
				ephemeral: true,
			});
		if (!permissions.checkClientToMember()) return;

		const mode = interaction.options.getNumber("mode", true);
		const name =
			mode === QueueRepeatMode.OFF
				? "Looping"
				: repeatModes.find((m) => m.value === mode)?.name;

		queue.setRepeatMode(mode as QueueRepeatMode);

		await createPlayerUI(interaction.guildId!);

		return interaction
			.reply({
				content: `**${name}** has been **${
					mode === queue.repeatMode ? "enabled" : "disabled"
				}**`,
				fetchReply: true,
			})
			.then((msg) => setTimeout(() => msg.delete(), second(10)));
	}
}

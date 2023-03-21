import { getDevGuildId } from "#utils/config";
import { Command } from "@sapphire/framework";
import { useQueue } from "discord-player";

export class UserCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			description: "Shuffles the tracks in the queue",
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
		const { voice, Emojis, createPlayerUI, second } =
			this.container.client.utils;
		const permissions = voice(interaction);

		const queue = useQueue(interaction.guildId!);
		if (!queue)
			return interaction.reply({
				content: `I am **not** in a voice channel`,
				ephemeral: true,
			});

		if (!permissions.checkClientToMember()) return;

		if (queue.tracks.size < 2)
			return interaction.reply({
				content: `There are not **enough tracks** in queue to **shuffle**`,
				ephemeral: true,
			});

		queue.tracks.shuffle();

		await createPlayerUI(interaction.guildId!);

		return interaction
			.reply({
				content: `${Emojis.Shuffle} | I have **shuffled** the queue`,
			})
			.then((interaction) =>
				setTimeout(() => interaction.delete(), second(10))
			);
	}
}

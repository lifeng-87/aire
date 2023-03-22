import { getDevGuildId } from "#utils/config";
import { ChatInputCommand, Command } from "@sapphire/framework";
import { ApplicationCommandType } from "discord.js";

export class UserCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry
	) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName(this.name)
					.setType(ApplicationCommandType.Message),
			{ guildIds: getDevGuildId() }
		);
	}

	public async contextMenuRun(
		interaction: Command.ContextMenuCommandInteraction<"cached">
	) {
		if (!interaction.isMessageContextMenuCommand()) return;

		const message = interaction.targetMessage;
		const { content } = message;
		const author = message.member?.nickname || message.author.username;
		const avatarURL =
			message.member?.avatarURL || message.author.avatarURL || "";
	}
}

/*	import { AireCommand } from "#lib/structures/commands/AireCommand";*/
import { LanguageKeys } from "#root/lib/i18n/languageKeys";
import { AireCommand } from "#root/lib/structures/commands/AireCommand";
import { getDevGuildId } from "#utils/config";
import { ApplyOptions } from "@sapphire/decorators";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ChatInputCommand, Command } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { ApplicationCommandType } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "ping",
	description: "Ping bot to see if it is alive.",
	enabled: true,
})
export class UserCommand extends AireCommand {
	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry
	) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName(this.name)
					.setDescription(this.description)
					.setDescriptionLocalization("zh-TW", "你媽"),
			{
				guildIds: getDevGuildId(),
			}
		);

		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName(this.name)
					.setType(ApplicationCommandType.Message),
			{
				idHints: ["1084063161994448946"],
				guildIds: getDevGuildId(),
			}
		);

		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName(this.name)
					.setType(ApplicationCommandType.User),
			{ guildIds: getDevGuildId() }
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({
			content: `Ping?`,
			ephemeral: true,
			fetchReply: true,
		});

		if (isMessageInstance(msg)) {
			const diff = msg.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);

			return interaction.editReply(
				await resolveKey(
					interaction,
					LanguageKeys.Commands.General.Ping.responses.pong,
					{ diff, ping }
				)
			);
		}

		/* `The round trip took **${diff}ms** and the heartbeat being **${ping}ms**`*/

		return interaction.editReply("Failed to retrieve ping :(");
	}

	public async contextMenuRun(
		interaction: Command.ContextMenuCommandInteraction
	) {
		const msg = await interaction.reply({ content: `Ping?`, fetchReply: true });

		if (isMessageInstance(msg)) {
			const diff = msg.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);
			return interaction.editReply(
				`The round trip took **${diff}ms** and the heartbeat being **${ping}ms**`
			);
		}

		return interaction.editReply("Failed to retrieve ping...");
	}
}

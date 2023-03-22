import type { QueueMetadata } from "#root/lib/types/GuildQueueMeta";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";
import { useQueue } from "discord-player";
import {
	type ButtonInteraction,
	type ChatInputCommandInteraction,
	type ContextMenuCommandInteraction,
	PermissionsBitField,
} from "discord.js";

export function voice(
	interaction:
		| ChatInputCommandInteraction
		| ContextMenuCommandInteraction
		| ButtonInteraction
) {
	const { member } = interaction;

	if (!isGuildMember(member))
		throw container.logger.error("is not GuildMember");

	const checkClient = async () => {
		const resolved = new PermissionsBitField([
			PermissionsBitField.Flags.Connect,
			PermissionsBitField.Flags.Speak,
			PermissionsBitField.Flags.ViewChannel,
		]);

		const missingPerms = member.voice.channel
			?.permissionsFor(interaction.guild!.members.me!)
			.missing(resolved);
		if (missingPerms?.length) {
			const content = `I am **missing** the required voice channel permissions: \`${missingPerms.join(
				", "
			)}\``;

			if (interaction.deferred) {
				await interaction.editReply({
					content,
				});
			} else {
				await interaction.reply({
					content,
					ephemeral: true,
				});
			}

			return false;
		}

		return true;
	};

	const checkMember = async () => {
		if (!member.voice.channel) {
			const content = `You **need** to be in a voice channel.`;
			if (interaction.deferred) {
				await interaction.editReply({ content });
			} else {
				await interaction.reply({ content, ephemeral: true });
			}
			return false;
		}
		return true;
	};

	const checkClientToMember = async () => {
		if (
			interaction.guild?.members.me?.voice.channelId &&
			member.voice.channelId !== interaction.guild?.members.me?.voice.channelId
		) {
			const content = `You are **not** in my voice channel`;
			if (interaction.deferred) {
				await interaction.editReply({ content });
			} else {
				await interaction.reply({ content, ephemeral: true });
			}

			return false;
		}

		return true;
	};

	return { checkClient, checkClientToMember, checkMember };
}

export function voiceButton(interaction: ButtonInteraction) {
	const queue = useQueue<QueueMetadata>(interaction.guildId!);

	const checkQueue = async () => {
		if (!queue) {
			await interaction.message.edit({
				content: "✅ Finished playing!",
				embeds: [],
				components: [],
			});

			return false;
		}

		return true;
	};

	const checkMessage = async () => {
		if (interaction.message.id !== queue?.metadata?.message.id) {
			await interaction.message.edit({
				content: "✅ Finished playing!",
				embeds: [],
				components: [],
			});

			return false;
		}

		return true;
	};

	return { checkQueue, checkMessage };
}

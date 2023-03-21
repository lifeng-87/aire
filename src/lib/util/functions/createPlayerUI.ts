import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from "discord.js";
import { Emojis } from "../constants";
import { useQueue } from "discord-player";
import type { Metadata } from "#root/lib/types/GuildQueueMeta";

export async function createPlayerUI(guildId: string) {
	const queue = useQueue<Metadata>(guildId);

	const embed = new EmbedBuilder();

	if (queue?.currentTrack) {
		const next = queue.tracks.at(0);

		embed
			.setTitle(queue.currentTrack!.title!)
			.setURL(queue.currentTrack!.url!)
			.setThumbnail(queue.currentTrack!.thumbnail!)
			.setDescription(`Requset by: ${queue.currentTrack?.requestedBy}`)
			.addFields({
				name: "Progress",
				value: `${
					queue.node.getTimestamp()?.current.label
				} >${queue.node.createProgressBar({
					timecodes: false,
					queue: false,
				})}< ${queue.node.getTimestamp()?.total.label}`,
			})
			.setFooter({
				text: `${queue.tracks.size} track(s) in queue`,
			})
			.setTimestamp();

		if (next) {
			embed.addFields({
				name: "Next track",
				value: `[\`${next?.title}\`](${next?.url})\nRequset by: ${next?.requestedBy}`,
			});
		}
	} else {
		embed
			.setTitle(`There is no track **currently** playing`)
			.setImage("https://tenor.com/view/stick-bug-rick-roll-lol-gif-18118062");
	}

	const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(
				queue?.node.isPlaying()
					? "@aire/player-button.pause"
					: "@aire/player-button.resume"
			)
			.setEmoji(queue?.node.isPlaying() ? Emojis.Pause : Emojis.Play)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("@aire/player-button.skip")
			.setEmoji(Emojis.FastForward)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("@aire/player-button.shuffle")
			.setEmoji(Emojis.Shuffle)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("@aire/player-button.repeat")
			.setLabel(["Off", "Track", "Queue", "Auto Play"][queue?.repeatMode || 0])
			.setEmoji(Emojis.Repeat)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("@aire/player-button.stop")
			.setEmoji(Emojis.Stop)
			.setStyle(ButtonStyle.Secondary)
	);

	const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("@aire/player-button.queue")
			.setEmoji(Emojis.PlaylistPlay)
			.setLabel("Queue")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("@aire/player-button.update")
			.setEmoji(Emojis.Undo)
			.setLabel("Update")
			.setStyle(ButtonStyle.Primary)
	);

	return queue?.metadata!.message.edit({
		embeds: [embed],
		components: [row1, row2],
	});
}

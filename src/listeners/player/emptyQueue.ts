import type { QueueMetadata } from "#lib/types/GuildQueueMeta";
import { Listener, container } from "@sapphire/framework";
import { GuildQueue, QueueRepeatMode } from "discord-player";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

export class PlayListener extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: "emptyQueue",
			emitter: container.client.player.events,
		});
	}

	public async run(queue: GuildQueue<QueueMetadata>) {
		if (!queue.currentTrack) return;

		const resolved = new PermissionsBitField([
			PermissionsBitField.Flags.SendMessages,
			PermissionsBitField.Flags.ViewChannel,
		]);
		const missingPerms = queue.metadata?.channel
			.permissionsFor(queue.metadata.channel.guild.members.me!)
			.missing(resolved);
		if (missingPerms?.length) return;

		const { components } = this.container.client.utils.createPlayerUI(
			queue.guild.id
		);

		if (queue.repeatMode === QueueRepeatMode.OFF)
			queue.metadata?.message.edit({
				embeds: [
					new EmbedBuilder()
						.setTitle(`There is no track **currently** playing`)
						.setImage(
							"https://media.tenor.com/kGekz062mwgAAAAd/hugs-rickroll.gif"
						),
				],
				components: components(),
			});

		/*	queue.setMetadata({ channel: queue.metadata!.channel, message: message! });*/
	}
}

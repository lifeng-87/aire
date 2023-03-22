import type { QueueMetadata } from "#lib/types/GuildQueueMeta";
import { Listener, container } from "@sapphire/framework";
import { GuildQueue } from "discord-player";
import { PermissionsBitField } from "discord.js";

export class PlayListener extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: "audioTracksAdd",
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

		const { embeds, components } = this.container.client.utils.createPlayerUI(
			queue.guild.id
		);

		queue.metadata?.message.edit({
			embeds: embeds(),
			components: components(),
		});

		/*	queue.setMetadata({ channel: queue.metadata!.channel, message: message! });*/
	}
}

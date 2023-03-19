import type { Metadata } from "#lib/types/GuildQueueMeta";
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

	public async run(queue: GuildQueue<Metadata>) {
		if (!queue.currentTrack) return;

		const resolved = new PermissionsBitField([
			PermissionsBitField.Flags.SendMessages,
			PermissionsBitField.Flags.ViewChannel,
		]);
		const missingPerms = queue.metadata?.channel
			.permissionsFor(queue.metadata.channel.guild.members.me!)
			.missing(resolved);
		if (missingPerms?.length) return;

		const message = await this.container.client.utils.createPlayerUI(
			queue.guild.id
		);

		queue.setMetadata({ channel: queue.metadata!.channel, message: message! });
	}
}

import { Listener, container } from "@sapphire/framework";
import { GuildQueue } from "discord-player";
import { PermissionsBitField, TextChannel } from "discord.js";
import type { Metadata } from "#lib/types/GuildQueueMeta";

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: "playerStart",
      emitter: container.client.player.events,
    });
  }

  public run(queue: GuildQueue<Metadata>) {
    const resolved = new PermissionsBitField([
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ViewChannel,
    ]);
    const missingPerms = (queue.metadata.interaction.channel as TextChannel)
      .permissionsFor(queue.metadata.interaction.guild?.members.me!)
      .missing(resolved);
    if (missingPerms.length) return;

    const editData = this.container.client.utils.createPlayerUI(queue);

    return queue.metadata.message.edit(editData);
  }
}

import { Listener, container } from "@sapphire/framework";
import { GuildQueue } from "discord-player";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import type { Metadata } from "#lib/types/GuildQueueMeta";
import { Track } from "discord-player";
import { Emojis } from "#utils/constants";

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: "playerStart",
      emitter: container.client.player.events,
    });
  }

  public run(queue: GuildQueue<Metadata>, track: Track) {
    const resolved = new PermissionsBitField([
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ViewChannel,
    ]);
    const missingPerms = (queue.metadata.interaction.channel as TextChannel)
      .permissionsFor(queue.metadata.interaction.guild?.members.me!)
      .missing(resolved);
    if (missingPerms.length) return;

    const next = queue.tracks.at(0);

    const embed = new EmbedBuilder()
      .setTitle(`${track.title}`)
      .setURL(track.url)
      .setThumbnail(track.thumbnail)
      .setDescription(
        `▶️ ${queue.node
          .createProgressBar({ queue: false })
          ?.replaceAll("┃", "")}`
      );

    if (next) {
      embed.addFields({
        name: "Next track",
        value: `[\`${next?.title}\`](${next?.url}) - ${next?.requestedBy}`,
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("@aire/player-button.pause")
        .setEmoji(Emojis.Pause)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("@aire/player-button.skip")
        .setEmoji(Emojis.Skip)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("@aire/player-button.shuffle")
        .setEmoji(Emojis.Shuffle)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("@aire/player-button.repeat")
        .setLabel(["off", "track", "queue", "auto play"][queue.repeatMode])
        .setEmoji(Emojis.Repeat)
        .setStyle(ButtonStyle.Secondary)
    );

    return queue.metadata.message.edit({
      embeds: [embed],
      components: [row],
    });
  }
}

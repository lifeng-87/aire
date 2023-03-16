import { GuildQueue } from "discord-player";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { Emojis } from "../constants";

export function createPlayerUI(queue: GuildQueue) {
  const next = queue.tracks.at(0);

  const embed = new EmbedBuilder()
    .setTitle(queue.currentTrack?.title!)
    .setURL(queue.currentTrack?.url!)
    .setThumbnail(queue.currentTrack?.thumbnail!)
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

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(
        queue.node.isPlaying()
          ? "@aire/player-button.pause"
          : "@aire/player-button.resume"
      )
      .setEmoji(queue.node.isPlaying() ? Emojis.Pause : Emojis.Play)
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
      .setLabel(["Off", "Track", "Queue", "Auto Play"][queue.repeatMode])
      .setEmoji(Emojis.Repeat)
      .setStyle(ButtonStyle.Secondary)
  );

  /*const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("@aire/player-button.related")
      .setEmoji("🔥")
      .setLabel("Related")
      .setStyle(ButtonStyle.Primary)
  );*/

  return { embeds: [embed], components: [row1] };
}

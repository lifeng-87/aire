import { getDevGuildId } from "#utils/config";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";
import { useQueue } from "discord-player";
import { ButtonStyle, ComponentType } from "discord.js";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override async registerApplicationCommands(
    registry: Command.Registry
  ) {
    registry.registerChatInputCommand(
      (command) => command.setName("queue").setDescription("queue"),
      { guildIds: getDevGuildId() }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const queue = useQueue(interaction.guildId!);

    if (!queue)
      return interaction.reply({
        content: `I am **not** in a voice channel`,
        ephemeral: true,
      });
    if (!queue.tracks || !queue.currentTrack)
      return interaction.reply({
        content: `There is **no** queue to **display**`,
        ephemeral: true,
      });

    let pagesNum = Math.ceil(queue.tracks.size / 5);
    if (pagesNum <= 0) pagesNum = 1;

    const tracks = queue.tracks.map(
      (track, idx) =>
        `**${(++idx).toString().padStart(2, "0")})** [\`${track.title}\`](${
          track.url
        }) - ${track.requestedBy}`
    );
    const paginatedMessage = new PaginatedMessage();

    // handle error if pages exceed 25 pages
    if (pagesNum > 25) pagesNum = 25;
    for (let i = 0; i < pagesNum; i++) {
      const list = tracks.slice(i * 5, i * 5 + 5).join("\n");

      paginatedMessage.addPageEmbed((embed) => {
        embed
          .setColor("Red")
          .setTitle(`**Queue** for **session** in **${queue.channel?.name}:**`)
          .setThumbnail(queue.currentTrack?.thumbnail!)
          .setDescription(
            `${`**Now Playing**\n[\`${queue.currentTrack?.title}\`](${queue.currentTrack?.url}`}) - ${
              queue.currentTrack?.requestedBy
            }\n`
          )
          .setFooter({
            text: `${queue.tracks.size} track(s) in queue`,
          });

        if (list != "") {
          embed.addFields({
            name: "More tracks",
            value: `${list}`,
          });
        }

        return embed;
      });
    }

    paginatedMessage.setActions([
      {
        customId: "@aire/queue-messages.firstPage",
        style: ButtonStyle.Secondary,
        emoji: "⏪",
        type: ComponentType.Button,
        run: ({ handler }) => (handler.index = 0),
      },
      {
        customId: "@aire/queue-messages.previousPage",
        style: ButtonStyle.Secondary,
        emoji: "◀️",
        type: ComponentType.Button,
        run: ({ handler }) => {
          if (handler.index === 0) {
            handler.index = handler.pages.length - 1;
          } else {
            --handler.index;
          }
        },
      },
      {
        customId: "@aire/queue-messages.nextPage",
        style: ButtonStyle.Secondary,
        emoji: "▶️",
        type: ComponentType.Button,
        run: ({ handler }) => {
          if (handler.index === handler.pages.length - 1) {
            handler.index = 0;
          } else {
            ++handler.index;
          }
        },
      },
      {
        customId: "@aire/queue-messages.goToLastPage",
        style: ButtonStyle.Secondary,
        emoji: "⏩",
        type: ComponentType.Button,
        run: ({ handler }) => (handler.index = handler.pages.length - 1),
      },
    ]);

    return paginatedMessage.run(interaction);
  }
}

import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";
import { useQueue } from "discord-player";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override async registerApplicationCommands(
    registry: Command.Registry
  ) {
    registry.registerChatInputCommand((command) =>
      command.setName("queue").setDescription("queue")
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
      (track, idx) => `**${++idx})** [${track.title}](${track.url})`
    );
    const paginatedMessage = new PaginatedMessage();

    // handle error if pages exceed 25 pages
    if (pagesNum > 25) pagesNum = 25;
    for (let i = 0; i < pagesNum; i++) {
      const list = tracks.slice(i * 5, i * 5 + 5).join("\n");

      paginatedMessage.addPageEmbed((embed) =>
        embed
          .setColor("Red")
          .setDescription(
            `**Queue** for **session** in **${queue.channel?.name}:**\n${
              list === "" ? "\n*• No more queued tracks*" : `\n${list}`
            }
            \n**Now Playing:** [${queue.currentTrack?.title}](${
              queue.currentTrack?.url
            })\n`
          )
          .setFooter({
            text: `${queue.tracks.size} track(s) in queue`,
          })
      );
    }

    return paginatedMessage.run(interaction);
  }
}

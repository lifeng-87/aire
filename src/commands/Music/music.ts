import { second } from "#utils/common";
import { voice } from "#utils/functions/perms";
import { getDevGuildId } from "#utils/config";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { useMasterPlayer, useQueue } from "discord-player";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { s } from "@sapphire/shapeshift";
import { createAutocomplateResult } from "#root/lib/util/functions/createAutocomplateResult";

export class UserCommand extends Subcommand {
  public constructor(context: Subcommand.Context, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: "music",
      subcommands: [
        { name: "play", chatInputRun: "chatInputPlay" },
        { name: "volume", chatInputRun: "chatInputVolume" },
        { name: "options", chatInputRun: "chatInputOptions" },
      ],
    });
  }

  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("music")
          .setDescription("Music system")
          .addSubcommand((command) =>
            command
              .setName("play")
              .setDescription("play")
              .addStringOption((opt) =>
                opt
                  .setName("query")
                  .setDescription("The query of your song!")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((command) =>
            command
              .setName("volume")
              .setDescription(
                "Changes the volume of the track and entire queue"
              )
              .addIntegerOption((opt) =>
                opt
                  .setName("amount")
                  .setDescription("The amount of volume you want to change to")
                  .setMaxValue(100)
                  .setMinValue(0)
              )
          )
          .addSubcommand((command) =>
            command
              .setName("options")
              .setDescription("Player options")
              .addStringOption((opt) =>
                opt
                  .setName("option")
                  .setDescription("option for player")
                  .addChoices(
                    { name: "# queue", value: "queue" },
                    { name: "# skip", value: "skip" },
                    { name: "# stop", value: "stop" },
                    { name: "# pause", value: "pause" },
                    { name: "# resume", value: "resume" },
                    { name: "# shuffle", value: "shuffle" },
                    { name: "# RepeatMode", value: "RepeatMode" },
                    { name: "# AutoPaly", value: "AutoPaly" },
                    { name: "# RelatedSong", value: "RelatedSong" }
                  )
                  .setRequired(true)
              )
          ),
      {
        idHints: ["1084063155497472112"],
        guildIds: getDevGuildId(),
      }
    );
  }

  public override async autocompleteRun(
    interaction: Subcommand.AutocompleteInteraction
  ) {
    const player = useMasterPlayer();
    const query = interaction.options.getString("query");
    const results = await player!.search(query!);
    const url = s.string.url();

    try {
      url.parse(query);
      return interaction.respond([]);
    } catch (error) {
      return interaction.respond(
        createAutocomplateResult(
          results.tracks.slice(0, 25).map((t) => ({
            name: t.title,
            value: t.url,
          }))
        )
      );
    }
  }

  public async chatInputPlay(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const player = useMasterPlayer();
    const memberIsOk = voice(interaction);

    if (typeof memberIsOk === "string") {
      return interaction.reply({ content: memberIsOk, ephemeral: true });
    }

    const query = interaction.options.getString("query");

    const results = await player!.search(query!);

    if (!results.hasTracks())
      return interaction.reply({
        content: `**No** tracks were found for your query`,
        ephemeral: true,
      });

    await interaction.deferReply();

    try {
      const res = await player!.play(memberIsOk.voice.channel!.id, results, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild?.members.me,
          },
          leaveOnEmptyCooldown: second(30),
          leaveOnEmpty: true,
          leaveOnEnd: false,
          bufferingTimeout: 0,
          selfDeaf: true,
        },
      });

      await interaction.editReply({
        content: `Successfully enqueued${
          res.track.playlist
            ? ` **multiple tracks** from: **${res.track.playlist.title}**`
            : `: **${res.track.title}**`
        }`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `An **error** has occurred`,
      });
      return this.container.logger.error(error);
    }
  }

  public async chatInputVolume(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const queue = useQueue(interaction.guildId!);
    const memberIsOk = voice(interaction);
    const volume = interaction.options.getInteger("amount");

    if (!queue)
      return interaction.reply({
        content: `I am not in a voice channel`,
        ephemeral: true,
      });

    if (!queue.currentTrack)
      return interaction.reply({
        content: `There is no track **currently** playing`,
        ephemeral: true,
      });

    if (!volume)
      return interaction.reply({
        content: `🔊 | **Current** volume is **${queue.node.volume}%**`,
      });

    if (typeof memberIsOk === "string") {
      return interaction.reply({ content: memberIsOk, ephemeral: true });
    }

    queue.node.setVolume(volume!);
    return interaction.reply({
      content: `I **changed** the volume to: **${queue.node.volume}%**`,
    });
  }

  public async chatInputOptions(
    interaction: Subcommand.ChatInputCommandInteraction
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

    switch (interaction.options.getString("option")) {
      case "queue": {
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

      case "skip": {
        queue.node.skip();
        return interaction.reply({
          content: `⏩ | I have **skipped** to the next track`,
        });
      }

      default: {
        return interaction;
      }
    }
  }
}

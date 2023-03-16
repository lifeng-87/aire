import { Command } from "@sapphire/framework";
import { s } from "@sapphire/shapeshift";
import { useMasterPlayer, useQueue } from "discord-player";
import { second } from "#utils/common";
import { type GuildMember } from "discord.js";
import { getDevGuildId } from "#utils/config";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (command) =>
        command
          .setName("play")
          .setDescription("Play a song")
          .addStringOption((opt) =>
            opt
              .setName("query")
              .setDescription("The query of your song!")
              .setAutocomplete(true)
          ),
      { guildIds: getDevGuildId() }
    );
  }

  public override async autocompleteRun(
    interaction: Command.AutocompleteInteraction
  ) {
    const player = useMasterPlayer();
    const query = interaction.options.getString("query");
    const url = s.string.url();

    try {
      url.parse(query);
      return interaction.respond([]);
    } catch (error) {
      let results = await player!.search(query!);
      if (!results.hasTracks()) {
        results = await player!.search("#music", {
          searchEngine: "youtubeSearch",
        });
      }

      return interaction.respond(
        this.container.client.utils.createAutocomplateResult(
          results.tracks.slice(0, 25).map((t) => ({
            name: t.title,
            value: t.url,
          }))
        )
      );
    }
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const permissions = this.container.client.utils.voice(interaction);
    if (!permissions.checkClient()) return;
    if (!permissions.checkMember()) return;
    if (!permissions.checkClientToMember()) return;

    const query = interaction.options.getString("query");
    if (!query) {
      const queue = useQueue(interaction.guildId!);
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

      queue.node.resume();
      return interaction.reply({
        content: `${this.container.client.utils.Emojis.Play} | **Playback** has been **resumed**`,
      });
    }

    const player = useMasterPlayer();

    const member = interaction.member as GuildMember;

    const results = (await player!.search(query!)).setRequestedBy(member.user);

    if (!results.hasTracks())
      return interaction.reply({
        content: `**No** tracks were found for your query`,
        ephemeral: true,
      });

    const msg = await interaction.deferReply();

    try {
      player!.play(member.voice.channel!.id, results, {
        nodeOptions: {
          metadata: {
            interaction: interaction,
            message: msg,
          },
          leaveOnEmptyCooldown: second(30),
          leaveOnEmpty: true,
          leaveOnEnd: false,
          bufferingTimeout: 0,
          selfDeaf: true,
        },
      });

      /*await interaction.editReply({
        content: `Successfully enqueued${
          res.track.playlist
            ? ` **multiple tracks** from: **${res.track.playlist.title}**`
            : `: **${res.track.title}**`
        }`,
      });*/
    } catch (error) {
      await interaction.editReply({
        content: `An **error** has occurred`,
      });
      return this.container.logger.error(error);
    }
  }
}

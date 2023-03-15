import { createAutocomplateResult, voice } from "#utils/functions";
import { Command } from "@sapphire/framework";
import { s } from "@sapphire/shapeshift";
import { useMasterPlayer } from "discord-player";
import { second } from "#utils/common";
import { type GuildMember } from "discord.js";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((command) =>
      command
        .setName("play")
        .setDescription("Play a song")
        .addStringOption((opt) =>
          opt
            .setName("query")
            .setDescription("The query of your song!")
            .setRequired(true)
            .setAutocomplete(true)
        )
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
        results = await player!.search("music");
      }

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

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const player = useMasterPlayer();
    const permissions = voice(interaction);

    if (!permissions.checkClient()) return;
    if (!permissions.checkMember()) return;
    if (!permissions.checkClientToMember()) return;

    const member = interaction.member as GuildMember;

    const query = interaction.options.getString("query");

    const results = await player!.search(query!);

    if (!results.hasTracks())
      return interaction.reply({
        content: `**No** tracks were found for your query`,
        ephemeral: true,
      });

    await interaction.deferReply();

    try {
      const res = await player!.play(member.voice.channel!.id, results, {
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
}

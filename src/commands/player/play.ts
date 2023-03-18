import { Command } from "@sapphire/framework";
import { s } from "@sapphire/shapeshift";
import { useMasterPlayer } from "discord-player";
import {
  type TextChannel,
  type GuildMember,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import { getDevGuildId } from "#utils/config";
import type { Metadata } from "#lib/types/GuildQueueMeta";

export class UserCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: "Plays and enqueues track(s) of the query provided",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (command) =>
        command
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((opt) =>
            opt
              .setName("query")
              .setDescription("A query of your choice")
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
    const { voice } = this.container.client.utils;
    const permissions = voice(interaction);
    const player = useMasterPlayer();
    const query = interaction.options.getString("query");

    if (!query) {
      const queue = player?.queues.get(interaction.guildId!);
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

      if (!permissions.checkClientToMember()) return;

      queue.node.resume();
      return interaction.reply({
        content: `${this.container.client.utils.Emojis.Play} | **Playback** has been **resumed**`,
      });
    }

    if (!permissions.checkClient()) return;
    if (!permissions.checkMember()) return;
    if (!permissions.checkClientToMember()) return;

    const member = interaction.member as GuildMember;

    const results = (await player!.search(query!)).setRequestedBy(member.user);

    if (!results.hasTracks())
      return interaction.reply({
        content: `**No** tracks were found for your query`,
        ephemeral: true,
      });

    const message = await interaction.reply({
      content: "Preparing player...",
      fetchReply: true,
    });

    try {
      const queue = player?.queues.get<Metadata>(interaction.guildId!);

      if (queue) {
        queue.metadata.message?.edit({
          content: "There has new treak(s) enqueued!",
          embeds: [],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(message.url)
                .setLabel("Took me to the new controller")
            ),
          ],
        });

        queue.setMetadata({
          channel: interaction.channel as TextChannel,
          message: message,
        });

        return player?.play(member.voice.channel!.id, results);
      } else {
        return player?.play(member.voice.channel!.id, results, {
          nodeOptions: {
            metadata: {
              channel: interaction.channel!,
              message: message,
            },
            leaveOnEmptyCooldown: this.container.client.utils.second(30),
            leaveOnEmpty: true,
            leaveOnEnd: false,
            bufferingTimeout: 0,
            selfDeaf: true,
          },
        });
      }

      /*await interaction.editReply({
        content: `Successfully enqueued${
          res.track.playlist
            ? ` **multiple tracks** from: **${res.track.playlist.title}**`
            : `: **${res.track.title}**`
        }`,
      });*/
    } catch (error) {
      await message.edit({
        content: `An **error** has occurred`,
      });
      return this.container.logger.error(error);
    }
  }
}

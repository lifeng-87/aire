import { createAutocomplateResult } from "#utils/functions/createAutocomplateResult";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { useMasterPlayer } from "discord-player";
import { AutocompleteInteraction } from "discord.js";

export class AutocompleteHandler extends InteractionHandler {
  public constructor(
    context: InteractionHandler.Context,
    options: InteractionHandler.Options
  ) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete,
    });
  }

  public override async run(
    interaction: AutocompleteInteraction,
    result: InteractionHandler.ParseResult<this>
  ) {
    return interaction.respond(result);
  }

  public override async parse(interaction: AutocompleteInteraction) {
    if (interaction.commandName !== "music") return this.none();

    const player = useMasterPlayer();
    const focusedOption = interaction.options.getFocused(true);

    switch (focusedOption.name) {
      case "query": {
        let searchResults = await player!.search("music");
        const query = interaction.options.getString("query");
        if (query) {
          searchResults = await player!.search(query);
        }
        return this.some(
          createAutocomplateResult(
            searchResults.tracks.slice(0, 25).map((trick) => ({
              name: trick.title,
              value: trick.url,
            }))
          )
        );
      }

      default: {
        return this.none();
      }
    }
  }
}

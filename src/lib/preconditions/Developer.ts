import { OWNERS_ID } from "#root/config";
import { AllFlowsPrecondition } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Message,
  Snowflake,
} from "discord.js";

export class UserPrecondition extends AllFlowsPrecondition {
  #message = "This command can only be used by the bot owner.";

  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.check(interaction.user.id);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.check(interaction.user.id);
  }

  public override messageRun(message: Message) {
    return this.check(message.author.id);
  }

  private check(userId: Snowflake) {
    return OWNERS_ID.includes(userId)
      ? this.ok()
      : this.error({ message: this.#message });
  }
}

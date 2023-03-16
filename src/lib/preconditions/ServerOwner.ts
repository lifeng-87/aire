import { AllFlowsPrecondition } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  GuildMember,
  Message,
} from "discord.js";

export class UserPrecondition extends AllFlowsPrecondition {
  #message = "This command can only be used by the guild owner.";

  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.check(interaction.member as GuildMember);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.check(interaction.member as GuildMember);
  }

  public override messageRun(message: Message) {
    return this.check(message.member as GuildMember);
  }

  private check(member: GuildMember) {
    return this.container.client.utils.isGuildOwner(member)
      ? this.ok()
      : this.error({ message: this.#message });
  }
}

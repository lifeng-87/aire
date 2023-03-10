import { GuildMember } from "discord.js";

export function isGuildOwner(member: GuildMember) {
  return member.id === member.guild.ownerId;
}

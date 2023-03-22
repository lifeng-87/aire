import { Message, GuildTextBasedChannel } from "discord.js";

export interface QueueMetadata {
	message: Message;
	channel: GuildTextBasedChannel;
}

import { Message, TextChannel, ThreadChannel } from "discord.js";

export interface Metadata {
	message: Message;
	thread: ThreadChannel;
	channel: TextChannel;
}

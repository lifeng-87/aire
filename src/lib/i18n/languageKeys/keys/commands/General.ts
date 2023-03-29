import { FT, T } from "#lib/types";

export const Ping = {
	name: T<string>("commands/general:ping.name"),
	description: T<string>("commands/general:ping.description"),
	responses: {
		pong: FT<{ diff: number; ping: number }>(
			"commands/general:ping.responses.pong"
		),
		failed: T<string>("commands/general:ping.failed"),
	},
};

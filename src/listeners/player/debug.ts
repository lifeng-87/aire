import { Listener, container } from "@sapphire/framework";

export class PlayListener extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: "debug",
			emitter: container.client.player.events,
			enabled: false,
		});
	}

	public async run(message: string) {
		this.container.logger.debug(message);
	}
}

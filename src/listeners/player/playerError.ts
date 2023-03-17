import { Listener, container } from "@sapphire/framework";

export class PlayListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: "playerError",
      emitter: container.client.player.events,
    });
  }

  public async run(error: Error) {
    this.container.logger.error(error);
  }
}

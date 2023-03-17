import { Listener, container } from "@sapphire/framework";

export class PlayListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: "error",
      emitter: container.client.player.events,
    });
  }

  public async run(error: Error) {
    this.container.logger.error(error);
  }
}

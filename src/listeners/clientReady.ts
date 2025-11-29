import { Listener, container } from "@sapphire/framework";
import { ActivityType, type Client } from "discord.js";

const NODE_ENV = process.env.NODE_ENV ?? "development";

export class ClientReadyListener extends Listener {
  public run(client: Client) {
    const { tag } = client.user!;
    this.container.logger.info(
      `Ready! Logged in as ${tag}`
    );

    if (NODE_ENV === "production") {
      client.user.setActivity("out for illegal business operations", { type: ActivityType.Watching });
      client.user.setStatus('idle')
    } else {
      client.user.setActivity("under maintenance, please avoid using this service", { type: ActivityType.Custom });
      client.user.setStatus('dnd')

      const guilds = client.guilds.cache.map(guild => `${guild.name} (${guild.id})`).join(", ");
      this.container.logger.info(
        `Currently in ${client.guilds.cache.size} servers: ${guilds}`
      );
    }
  }
}

import { Listener, container } from "@sapphire/framework";
import { ActivityType, type Client } from "discord.js";

export class ReadyListener extends Listener {
  public run(client: Client) {
    const { tag } = client.user!;
    this.container.logger.info(
      `Ready! Logged in as ${tag}`
    );

    // client.user.setActivity("out for illegal business operations", { type: ActivityType.Watching });
    // client.user.setStatus('idle')

    client.user.setActivity("under maintenance, please avoid using this service", { type: ActivityType.Custom });
    client.user.setStatus('dnd')

    // log the servers the bot is in
    const guilds = client.guilds.cache.map(guild => guild.name).join(", ");
    this.container.logger.info(
      `Currently in ${client.guilds.cache.size} servers: ${guilds}`
    );
  }
}

import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "ping",
  description: "Check the bot's latency",
  cooldownDelay: 2_000,
})
export default class PingCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand((command) => {
      command.setName(this.name).setDescription(this.description);
    });
  }

  public chatInputRun(interaction: ChatInputCommandInteraction) {
    return interaction.reply({
      content: `Pong! \`${this.container.client.ws.ping}ms\``,
    });
  }
}

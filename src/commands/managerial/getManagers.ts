import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

import { databaseConnection } from "../../database";
const connection = new databaseConnection();

async function GetManagersFromDistrict(district: string) {
  var table = connection.prisma.managerTable

  var rows = await table.findMany({ where: { District: district } });

  if (rows.length === 0) {
    return [`No managers found for district: ${district}`];
  }

  let managersList = rows.map((row) => {
    return `<@${row.DiscordId}> - ${row.TrelloId}`;
  });

  return managersList;
}

@ApplyOptions<Command.Options>({
  name: "get-managers",
  description: "Get the list of managers for a specific district",
  cooldownDelay: 5_000,
})
export default class ViewHistoryCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand((command) => {
      command
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('district')
            .setDescription('The district you want to view the managers for')
            .setRequired(true)
            .addChoices(
              { name: 'Redwood', value: 'Redwood' },
              { name: 'Arborfield', value: 'Arborfield' },
              { name: 'Prominence', value: 'Prominence' },
              { name: 'Unincorporated Areas', value: 'Unincorporated' }
            )
        );
    }, {
      guildIds: [],
    });
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const district = interaction.options.getString("district", true);

    try {

      let managers: string[];
      try {
        managers = await GetManagersFromDistrict(district);
      } catch (err) {
        console.error("Error fetching moderation history:", err);
        managers = ["An error occurred while fetching the moderation history."];
      }

      const newEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(global.embeds.embedColors.mgmt)
        .setTitle(`${district} Managers`)
        .setTimestamp()
        .setFooter(global.embeds.embedFooter);

      for (let i = 0; i < managers.length; i++) {
        newEmbed.addFields({
          name: (i + 1).toString(),
          value: managers[i],
          inline: false,
        });
      }

      return interaction.editReply({
        embeds: [newEmbed]
      });

    } catch (error) {
      console.error("Error in chatInputRun:", error);

      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({
          content: "An unexpected error occurred while processing your request.",
          embeds: []
        });
      } else {
        return interaction.reply({
          content: "An unexpected error occurred while processing your request.",
        });
      }
    }
  }
}

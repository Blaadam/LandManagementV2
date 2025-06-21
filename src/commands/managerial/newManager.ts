import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

import { databaseConnection } from "../../database";
const connection = new databaseConnection();

async function AddManagerToDistrict(
  managerId: bigint,
  district: string,
  trelloId: string
) {
  var table = connection.prisma.managerTable;

  // Check if the manager already exists in the district
  const existingManager = await table.findFirst({
    where: { DiscordId: managerId, District: district },
  });

  if (existingManager) {
    return `Manager <@${managerId}> is already assigned to district ${district}.`;
  }

  // Add the new manager to the district
  await table.create({
    data: {
      DiscordId: managerId,
      District: district,
      TrelloId: trelloId,
      AssignedAt: new Date(),
    },
  });

  return `Manager <@${managerId}> has been successfully added to district ${district} with Trello ID ${trelloId}.`;
}

@ApplyOptions<Command.Options>({
  name: "new-manager",
  description: "Add a new manager to a district",
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

        .addUserOption(option =>
          option
            .setName('manager')
            .setDescription('The member you would like to assign as a manager')
            .setRequired(true))

        .addStringOption(option =>
          option
            .setName('district')
            .setDescription('The district you want to view the managers for')
            .setRequired(true)
            .addChoices(
              { name: 'Redwood', value: 'Redwood' },
              { name: 'Arborfield', value: 'Arborfield' },
              { name: 'Prominence', value: 'Prominence' },
              { name: 'Unincorporated Areas', value: 'Unincorporated Areas' }
            )
        )

        .addStringOption(option =>
          option.setName('trello')
            .setDescription('Their unique TrelloID')
            .setRequired(true))

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
    });
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const manager = interaction.options.getUser("manager", true)
    const district = interaction.options.getString("district", true)
    const trelloID = interaction.options.getString("trello", true)

    let response: string;
    try {
      try {
        response = await AddManagerToDistrict(
          BigInt(manager.id),
          district,
          trelloID
        );
      } catch (err) {
        console.error("Error fetching moderation history:", err);
        response = "An error occurred while adding the manager to the district.";
      }
    } catch (error) {
      console.error("Error in new-manager command:", error);
      response = "An unexpected error occurred while processing your request.";
    }

    return interaction.editReply({
      content: response,
    });
  }
}

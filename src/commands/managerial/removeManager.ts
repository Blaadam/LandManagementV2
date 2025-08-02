import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

import { databaseConnection } from "../../database";
const connection = new databaseConnection();

async function RemoveManagerFromDistrict(
  managerId: bigint,
  district: string
) {
  var table = connection.prisma.managerTable;

  const existingManager = await table.findFirst({
    where: { DiscordId: managerId, District: district },
  });

  if (!existingManager) {
    return `Manager <@${managerId}> is not assigned to district ${district}.`;
  }

  await table.delete({ where: { Id: existingManager.Id } });
  return `Manager <@${managerId}> has been successfully removed from district ${district}.`;
}

@ApplyOptions<Command.Options>({
  name: "remove-manager",
  description: "Remove a manager from a district",
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
              { name: 'Unincorporated Areas', value: 'Unincorporated' }
            )
        )

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
    });
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const manager = interaction.options.getUser("manager", true)
    const district = interaction.options.getString("district", true)

    let response: string;
    try {
      try {
        response = await RemoveManagerFromDistrict(
          BigInt(manager.id),
          district
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

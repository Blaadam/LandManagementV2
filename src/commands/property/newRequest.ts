import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
    name: "new-request",
    description: "Create a new property request",
    cooldownDelay: 2_500,
})
export default class ViewHistoryCommand extends Command {
    public override registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ) {
        registry.registerChatInputCommand((command) => {
            command
                .setName(this.name)
                .setDescription(this.description);
        });
    }

    public async chatInputRun(interaction: ChatInputCommandInteraction) {
        const modal = new ModalBuilder()
      .setCustomId("request-modal")
      .setTitle("New Property");

    const businessPermit = new TextInputBuilder()
      .setCustomId("businessPermit")
      .setLabel("Business Permit")
      .setPlaceholder("https://trello.com/b/r4a8Tw1I/commerce-permit-database")
      .setStyle(TextInputStyle.Short);

    const businessGroup = new TextInputBuilder()
      .setCustomId("businessGroup")
      .setLabel("Business Group")
      .setPlaceholder("Firestone Department of Commerce")
      .setStyle(TextInputStyle.Short);

    const propertiesBefore = new TextInputBuilder()
      .setCustomId("propertiesBefore")
      .setLabel("Will this be your first or second property?")
      .setPlaceholder("[FIRST / SECOND]")
      .setStyle(TextInputStyle.Paragraph);

    const requestedLand = new TextInputBuilder()
      .setCustomId("requestedLand")
      .setLabel("What property would you like to request")
      .setPlaceholder("[LINK]")
      .setStyle(TextInputStyle.Short);

    const propertyUse = new TextInputBuilder()
      .setCustomId("propertyUse")
      .setLabel("How will your property be used?")
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(businessPermit);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(businessGroup);
    const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(propertiesBefore);
    const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(requestedLand);
    const fifthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(propertyUse);

    // Add inputs to the modal
    modal.addComponents(
      firstActionRow,
      secondActionRow,
      thirdActionRow,
      fourthActionRow,
      fifthActionRow
    );
    return await interaction.showModal(modal);
  }
}

import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    LabelBuilder,
    ModalBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle,
    type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
    name: "new-activity",
    description: "Create a new property activity submission",
    cooldownDelay: 10_000,
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
            .setCustomId("activity-modal")
            .setTitle("Activity Submission");

        const businessNameLabel = new LabelBuilder()
            .setLabel("Business")
            .setTextInputComponent(
                new TextInputBuilder()
                    .setCustomId("businessName")
                    .setPlaceholder("Spectra Pipeline Management")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            );

        const randomTextDisplay = new TextDisplayBuilder()
            .setContent("Please select the property district from the dropdown menu below.");

        const propertyMenu = new LabelBuilder()
            .setLabel("Property District")
            .setStringSelectMenuComponent(
                new StringSelectMenuBuilder()
                    .setCustomId("propertyDistrict")
                    .setPlaceholder("Select the property district")
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Redwood")
                            .setValue("Redwood")
                            .setDescription("Properties located within the Redwood District"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Arborfield")
                            .setValue("Arborfield")
                            .setDescription("Properties located within the Arborfield District"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Prominence")
                            .setValue("Prominence")
                            .setDescription("Properties located within the Prominence District"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Unincorporated")
                            .setValue("Unincorporated")
                            .setDescription("Properties located within the Hillview, Greendale and Arborfield Farms Districts"),
                    )
                    .setRequired(true)
            )

        const propertyActivityLabel = new LabelBuilder()
            .setLabel("Property Activity Evidence")
            .setTextInputComponent(
                new TextInputBuilder()
                    .setCustomId("propertyActivity")
                    .setPlaceholder("[LINK]")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            );

        const additionalInformationLabel = new LabelBuilder()
            .setLabel("Additional Information")
            .setTextInputComponent(
                new TextInputBuilder()
                    .setCustomId("additionalInformation")
                    .setPlaceholder("Default: N/A")
                    .setStyle(TextInputStyle.Paragraph)
            );

        modal.addLabelComponents(businessNameLabel);
        modal.addTextDisplayComponents(randomTextDisplay);
        modal.addLabelComponents(propertyMenu, propertyActivityLabel, additionalInformationLabel);

        return await interaction.showModal(modal);
    }
}

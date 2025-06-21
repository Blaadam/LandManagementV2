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
            .setCustomId("activityModal")
            .setTitle("Activity Submission");

        const businessName = new TextInputBuilder()
            .setCustomId("businessName")
            .setLabel("Business")
            .setPlaceholder("Spectra Pipeline Management")
            .setStyle(TextInputStyle.Short);

        const propertyDistrict = new TextInputBuilder()
            .setCustomId("propertyDistrict")
            .setLabel("Property District")
            .setPlaceholder("Redwood, Prominence, Unincorporated & Prominence\nALT: Farms, Hillview, Greendale")
            .setStyle(TextInputStyle.Short);

        const propertyActivity = new TextInputBuilder()
            .setCustomId("propertyActivity")
            .setLabel("Property Activity Evidence")
            .setPlaceholder("[LINK]")
            .setStyle(TextInputStyle.Paragraph);

        const additionalInformation = new TextInputBuilder()
            .setCustomId("additionalInformation")
            .setLabel("Additional Information")
            .setPlaceholder("Default: N/A")
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(businessName);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(propertyDistrict);
        const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(propertyActivity);
        const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(additionalInformation);

        modal.addComponents(
            firstActionRow,
            secondActionRow,
            thirdActionRow,
            fourthActionRow
        );

        return await interaction.showModal(modal);

    }
}

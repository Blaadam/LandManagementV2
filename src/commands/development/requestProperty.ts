import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    FileUploadBuilder,
    LabelBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle,
    type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
const Sentry = require("@sentry/node");

@ApplyOptions<Command.Options>({
    name: "request-property",
    description: "Make a request for a property file.",
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
            .setCustomId("property-request-modal")
            .setTitle("Property Request");

        const landPermitLabel = new LabelBuilder()
            .setLabel("BLM Land Permit")
            .setTextInputComponent(
                new TextInputBuilder()
                    .setCustomId("landPermit")
                    .setPlaceholder("[LINK TO LAND MANAGEMENT DATABASE PROPERTY LISTING]")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            );

        const propertyIntentionsLabel = new LabelBuilder()
            .setLabel("Property Intentions")
            .setTextInputComponent(
                new TextInputBuilder()
                    .setCustomId("propertyIntentions")
                    .setPlaceholder("[INTENTIONS]")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            );

        const furtherInformationLabel = new LabelBuilder()
            .setLabel("Further Information")
            .setTextInputComponent(
                new TextInputBuilder()
                    .setCustomId("furtherInformation")
                    .setPlaceholder("Default: N/A")
                    .setStyle(TextInputStyle.Paragraph)
            );

        modal.addLabelComponents(landPermitLabel, propertyIntentionsLabel, furtherInformationLabel);

        Sentry.logger.info(`Property request modal opened by ${interaction.user.globalName} (${interaction.user.id})`, {
            user: { id: interaction.user.id, username: interaction.user.globalName },
            "command.name": this.name,
            "command.status": "success",
            "command.modal": "property-request-modal"
        });

        return await interaction.showModal(modal);
    }
}

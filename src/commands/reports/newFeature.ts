import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
const Sentry = require("@sentry/node");

@ApplyOptions<Command.Options>({
    name: "new-feature-request",
    description: "Create a new feature request submission",
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
            .setCustomId("feature-request-modal")
            .setTitle("Feature Request Submission");

        const featureTitle = new TextInputBuilder()
            .setCustomId("featureTitle")
            .setLabel("Feature Title")
            .setPlaceholder("Enter the title of the feature")
            .setStyle(TextInputStyle.Short);

        const featureDesc = new TextInputBuilder()
            .setCustomId("featureDesc")
            .setLabel("Feature Description")
            .setPlaceholder("Enter a description of the feature, including use cases and how it would work")
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(featureTitle);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(featureDesc);

        modal.addComponents(
            firstActionRow,
            secondActionRow
        );

        return await interaction.showModal(modal);
    }
}

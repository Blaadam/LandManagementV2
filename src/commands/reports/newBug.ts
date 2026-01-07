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
    name: "new-bug-report",
    description: "Create a new bug report submission",
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
            .setCustomId("bug-report-modal")
            .setTitle("Bug Report Submission");

        const bugTitle = new TextInputBuilder()
            .setCustomId("bugTitle")
            .setLabel("Bug Title")
            .setPlaceholder("Enter the title of the bug")
            .setStyle(TextInputStyle.Short);

        const bugDesc = new TextInputBuilder()
            .setCustomId("bugDesc")
            .setLabel("Bug Description")
            .setPlaceholder("Enter a description of the bug")
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(bugTitle);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(bugDesc);

        modal.addComponents(
            firstActionRow,
            secondActionRow
        );

        Sentry.logger.info(`Bug report modal opened by ${interaction.user.globalName} (${interaction.user.id})`, {
            user: { id: interaction.user.id, username: interaction.user.globalName },
            "command.name": this.name,
            "command.status": "success",
            "command.modal": "bug-report-modal"
        });

        return await interaction.showModal(modal);
    }
}

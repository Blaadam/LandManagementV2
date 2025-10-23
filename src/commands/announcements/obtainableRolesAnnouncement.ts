import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
    TextChannel,
    type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
    name: "roles-announcement",
    description: "Create an announcement for obtainable roles",
    cooldownDelay: 10_000,
})
export default class ViewHistoryCommand extends Command {
    public override registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ) {
        registry.registerChatInputCommand((command) => {
            command
                .setName(this.name)
                .setDescription(this.description)
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
        });
    }

    public async chatInputRun(interaction: ChatInputCommandInteraction) {
        // if (interaction.user.id != "251442524516909058") {
        //     return interaction.reply("Nuh uh")
        // }

        const newEmbed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL:
                    interaction.user.displayAvatarURL({ extension: "png", size: 512 }),
            })
            .setTitle("Notice of Obtainable Roles")
            .setDescription(
                "Dear Esteemed Users," +
                "\n\n" +
                "We are excited to introduce three new roles in our Discord server: \"LM-NOTIF-OPT,\" \"OPA-NOTIF-OPT,\" and \"IO-NOTIF-OPT\". " +
                "\n\n" +
                "1. <@&1164856752181870642>: Stay informed about Land Management updates and discussions.\n" +
                "2. <@&1165634179497738292>: Be the first to know about new developments in the Office of Public Affairs\n" +
                "3. <@&1165634260649115749>: Receive updates on our Inspections Office initiatives." +
                "\n\n" +
                "To opt in, simple click on the corrosponding button in attached below the message. If you have any queries, our support team is ready to assist." +
                "\n\n" +
                "Enjoy exploring these new roles!" +
                "\n\n" +
                "Best Regards,\n" +
                "Firestone Department of Commerce: Discord Server Team"

            )
            .setTimestamp()
            .setColor(global.embeds.embedColors.mgmt)
            .setFooter(global.embeds.embedFooter);

        // Create a link button
        const landnotifrole = new ButtonBuilder()
            .setCustomId('landnotifrole')
            .setLabel('Obtain the LM-NOTIF-OPT role')
            .setStyle(ButtonStyle.Success);

        const publnotifrole = new ButtonBuilder()
            .setCustomId('publnotifrole')
            .setLabel('Obtain the OPA-NOTIF-OPT role')
            .setStyle(ButtonStyle.Success);

        const inspnotifrole = new ButtonBuilder()
            .setCustomId('inspnotifrole')
            .setLabel('Obtain the IO-NOTIF-OPT role')
            .setStyle(ButtonStyle.Success);

        // Create an action row to store the button
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(landnotifrole, publnotifrole, inspnotifrole);

        // Send the content to the channel
        const channel = await interaction.client.channels.fetch("735894843259355288") as TextChannel;
        channel.send({ embeds: [newEmbed], components: [row] });

        // Client returner
        return interaction.reply({
            content: "Sent Message",
            flags: ["Ephemeral"],
        });

    }
}

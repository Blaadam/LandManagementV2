import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "revoke-permit",
  description: "Sends a message that an individual passed their Business Permit Application",
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
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The name of owner / business rep")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("permit")
            .setDescription("The link to permit on docm permit trello board")
            .setRequired(true)
        )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
    });
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: ["Ephemeral"], });

    const user = interaction.options.getUser('user');
    const permitLink = interaction.options.getString('permit');

    const member = interaction.options.getMember('user') as GuildMember;

    const businessRepRole = member.guild.roles.cache.find(role => role.name === "Business Representative");
    member.roles.remove(businessRepRole);

    const newEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.tag,
        iconURL:
          interaction.user.displayAvatarURL({ extension: "png", size: 512 }),
      })
      .setTitle("Business Permit Revocation")
      .setDescription(
        `Hello ${user},
                I am sending this to inform you that your business permit for ${permitLink} has been revoked. The current reason for the revocation is listed on the permit card.
                If you wish to continue your operations within Stapleton County, you must reapply for a __new__ business permit.
                Please refrain from operating in Stapleton County while your business permit is expired, as it is against the law.
                
                Any land permit(s) owned by your business have been revoked and are available to other businesses
                https://trello.com/b/v2fxXXhn/land-management-database

                If you have any questions, feel free to DM ${interaction.user} or reach out to any other Commerce Employee.

                Best Regards,
                ${interaction.user}
                Firestone Department of Commerce`
      )
      .setTimestamp()
      .setColor(global.embeds.embedColors.mgmt)
      .setFooter(global.embeds.embedFooter);

    if (!user) {
      return interaction.editReply({ content: "User not found." });
    }

    const dmChannel = await user.createDM();
    if (!dmChannel) {
      return interaction.editReply({ content: "Could not create DM channel." });
    }

    dmChannel.send({ embeds: [newEmbed] });

    return interaction.editReply({ content: `Message sent to ${user.tag} successfully!` });
  }
}

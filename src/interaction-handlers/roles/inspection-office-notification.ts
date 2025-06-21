import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction, GuildMember } from 'discord.js';

const SEARCH_ROLE = "IO-NOTIF-OPT"

@ApplyOptions({
    name: "inspnotifrole",
})
export class ButtonHandler extends InteractionHandler {
    public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Button
        });
    }

    public override parse(interaction: ButtonInteraction) {
        if (interaction.customId !== this.name) return this.none();

        return this.some();
    }

    public async run(interaction: ButtonInteraction) {
        let guild = interaction.guild
        let member = guild.members.cache.get(interaction.user.id)

        let role = interaction.guild.roles.cache.find(
            (role) => role.name === SEARCH_ROLE
        );
        if (role) {

            let hasRole = member.roles.cache.some(role => role.name === SEARCH_ROLE)

            if (hasRole) {
                (interaction.member as GuildMember).roles.remove(role);
                return interaction.reply({ content: `Your role for \"${SEARCH_ROLE}\" has been removed.`, ephemeral: true })
            }
            else {
                (interaction.member as GuildMember).roles.add(role);
                return interaction.reply({ content: `Your role for \"${SEARCH_ROLE}\" has been added.`, ephemeral: true })
            }
        }
        else {
            return interaction.reply({ content: "Couldn't find the role :(", ephemeral: true })
        }
    }
}
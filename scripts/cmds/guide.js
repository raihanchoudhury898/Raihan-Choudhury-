module.exports = {
	config: {
		name: "guide",
		version: "1.0",
		author: "Raihan Choudhury",
		countDown: 5,
		role: 0,
		description: {
			en: "View guide of any command"
		},
		category: "utility",
		guide: {
			en: "{pn} <command name>"
		}
	},

	langs: {
		en: {
			noCommand: "❌ | Please enter a command name.\n\nExample:\nguide ban\nguide kick\nguide nickname",
			notFound: "❌ | Command \"%1\" not found.",
			noGuide: "❌ | No guide available for command \"%1\"."
		}
	},

	onStart: async function ({ args, message, getLang }) {
		if (!args[0])
			return message.reply(getLang("noCommand"));

		const commandName = args[0].toLowerCase();

		const command =
			global.GoatBot.commands.get(commandName) ||
			Array.from(global.GoatBot.commands.values()).find(cmd =>
				cmd.config.aliases?.includes(commandName)
			);

		if (!command)
			return message.reply(getLang("notFound", commandName));

		const guide =
			command.config.guide?.en ||
			command.config.guide?.vi;

		if (!guide)
			return message.reply(getLang("noGuide", commandName));

		const msg =
			`╭─📖 COMMAND GUIDE\n` +
			`├ Name: ${command.config.name}\n` +
			`╰─────────────\n\n` +
			guide;

		return message.reply(msg);
	}
};

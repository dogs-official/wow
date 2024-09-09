const { Context } = require("telegraf");
const getLocales = require("./getLocales");
const getConfig = require("./getConfig");
const userModel = require("../Models/user.model");
const templateEngine = require("./templateEngine");

const config = getConfig();
const locales = getLocales(config.locales);

/**
 * @param {Context} ctx
 */
module.exports = async (ctx, locale = "") => {
    let language = locale;
    if (!language) {
        const user = await userModel.findById(ctx.chat.id);
        language = locales.find((locale) => locale.code == user.language);
    }

    await ctx.sendMessage(templateEngine(language.start.welcome), {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: language.keyboards.balance,
                        callback_data: "balances",
                    },
                ],
                [
                    {
                        text: language.keyboards.deposit,
                        callback_data: "deposit",
                    },
                    {
                        text: language.keyboards.withdraw,
                        callback_data: "withdraw",
                    },
                ],
                [
                    {
                        text: language.keyboards.invite,
                        callback_data: "invite",
                    },
                ],
            ],
        },
    });
};

const { Scenes } = require("telegraf");
const {
    getLocales,
    getConfig,
    catcher,
    templateEngine,
    sendMenu,
} = require("../Functions/manager");
const userModel = require("../Models/user.model");
const { TronWeb } = require("tronweb");

const config = getConfig();
const locales = getLocales(config.locales);
module.exports = new Scenes.WizardScene(
    "withdraw",
    async (ctx) => {
        try {
            await ctx.answerCbQuery();
            const user = await userModel.findById(ctx.chat.id);
            const locale = locales.find(
                (locale) => locale.code == user.language
            );
            ctx.wizard.state.locale = locale;
            if (!user.balances.deposit) {
                await ctx.sendMessage(
                    templateEngine(locale.errors.cantWithdraw),
                    {
                        parse_mode: "HTML",
                    }
                );
                return await ctx.scene.leave();
            }
            await ctx.sendMessage(templateEngine(locale.withdraw.sendAmount), {
                parse_mode: "HTML",
            });
            return ctx.wizard.next();
        } catch (error) {
            catcher(error, ctx).catch(() => {});
        }
    },
    async (ctx) => {
        try {
            if (config.back.includes(ctx.message?.text)) {
                await sendMenu(ctx, ctx.wizard.state.locale);
                return await ctx.scene.leave();
            }
            const { locale } = ctx.wizard.state;
            const amount = parseFloat(ctx.message.text);
            if (!amount) {
                await ctx.sendMessage(
                    templateEngine(locale.errors.invalidNumber),
                    {
                        parse_mode: "HTML",
                    }
                );
            } else {
                ctx.wizard.state.amount = amount;
                await ctx.sendMessage(
                    templateEngine(locale.withdraw.sendWallet),
                    { parse_mode: "HTML" }
                );
                return ctx.wizard.next();
            }
        } catch (error) {
            catcher(error, ctx).catch(() => {});
        }
    },
    async (ctx) => {
        try {
            if (config.back.includes(ctx.message?.text)) {
                await sendMenu(ctx, ctx.wizard.state.locale);
                return await ctx.scene.leave();
            }
            const { locale } = ctx.wizard.state;
            if (!TronWeb.isAddress(ctx.message.text)) {
                await ctx.sendMessage(
                    templateEngine(locale.errors.invalidWallet),
                    { parse_mode: "HTML" }
                );
            } else {
                await ctx.telegram.sendMessage(
                    config.admin,
                    `🧊 New withdrawal request ${ctx.chat.id}`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "✅ Accept",
                                        callback_data: `withdraw accept ${ctx.chat.id}`,
                                    },
                                    {
                                        text: "⭕ Deny",
                                        callback_data: `withdraw deny ${ctx.chat.id}`,
                                    },
                                ],
                            ],
                        },
                    }
                );
                await ctx.sendMessage(
                    templateEngine(locale.withdraw.processing),
                    { parse_mode: "HTML" }
                );
                return await ctx.scene.leave();
            }
        } catch (error) {
            catcher(error, ctx).catch(() => {});
        }
    }
);

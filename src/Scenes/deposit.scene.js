const { Scenes } = require("telegraf");
const userModel = require("../Models/user.model");
const {
    getLocales,
    getConfig,
    catcher,
    templateEngine,
} = require("../Functions/manager");

const config = getConfig();
const locales = getLocales(config.locales);

module.exports = new Scenes.WizardScene(
    "deposit",
    async (ctx) => {
        try {
            await ctx.answerCbQuery();
            const user = await userModel.findById(ctx.chat.id);
            const locale = locales.find(
                (locale) => locale.code == user.language
            );
            ctx.wizard.state.locale = locale;
            await ctx.sendMessage(
                templateEngine(
                    locale.deposit.sendProof,
                    "$" + config.limits.minimumDeposit,
                    config.walletAddress
                ),
                {
                    parse_mode: "HTML",
                }
            );
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
            const language = ctx.wizard.state.locale;
            if (
                !ctx.message?.text?.startsWith("/start") &&
                !ctx.callbackQuery?.data
            ) {
                await ctx.forwardMessage(config.admin);
                await ctx.telegram.sendMessage(
                    config.admin,
                    `🔥 New deposit request from <b>${ctx.chat.id}</b>`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "✅ Accept",
                                        callback_data: `deposit accept ${ctx.chat.id}`,
                                    },
                                    {
                                        text: "⭕ Deny",
                                        callback_data: `deposit deny ${ctx.chat.id}`,
                                    },
                                ],
                            ],
                        },
                    }
                );
                await ctx.sendMessage(
                    templateEngine(language.deposit.processing),
                    {
                        parse_mode: "HTML",
                    }
                );
            }
            if (!ctx.callbackQuery && ctx.message?.text == "/start") {
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
            } else if (ctx.callbackQuery) await ctx.answerCbQuery();
            return await ctx.scene.leave();
        } catch (error) {
            catcher(error, ctx).catch(() => {});
        }
    }
);

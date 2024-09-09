const { Scenes } = require("telegraf");
const {
    getConfig,
    getLocales,
    templateEngine,
    catcher,
} = require("../Functions/manager");
const config = getConfig();
const locales = getLocales(config.locales);
const userModel = require("../Models/user.model");

module.exports = new Scenes.WizardScene(
    "signup",
    async (ctx) => {
        try {
            const user = await userModel.findById(ctx.chat.id);
            const splittedText = ctx.message.text.split(" ");
            if (splittedText[1]) ctx.wizard.state.referrer = splittedText[1];
            if (user) {
                const language = locales.find(
                    (locale) => locale.code == user.language
                );
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
                return await ctx.scene.leave();
            }
            const index = locales.findIndex((locale) => locale.code == "en-us");
            const locale = index < 0 ? locales[0] : locales[index];
            if (locales.length == 1) {
                await ctx.sendMessage(
                    templateEngine(locale.start.sendPhoneNumber),
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [[{ text: "👥", request_contact: true }]],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                        },
                    }
                );
                ctx.wizard.state.language = locale;
                return ctx.wizard.next();
            }
            await ctx.sendMessage("🌐 Please select your language", {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: locales.map((locale) => [
                        {
                            text: locale.display,
                            callback_data: locale.code,
                        },
                    ]),
                },
            });
            return ctx.wizard.next();
        } catch (error) {
            catcher(error, ctx).catch(() => {});
        }
    },
    async (ctx) => {
        try {
            const language = ctx.wizard.state.language;
            if (ctx.callbackQuery?.data) {
                await ctx.answerCbQuery();
                ctx.wizard.state.language = locales.find(
                    (locale) => locale.code == ctx.callbackQuery.data
                );
                await ctx.sendMessage(
                    templateEngine(language.start.sendPhoneNumber),
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [[{ text: "👥", request_contact: true }]],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                        },
                    }
                );
                return ctx.wizard.next();
            }
            const user = new userModel({
                _id: ctx.chat.id,
                language: language.code,
                dateCreated: Date.now(),
                phoneNumber: ctx.message.contact.phone_number,
            });
            user.balances.reward = config.rewards.signupBonus;
            const referredBy = await userModel.findById(
                ctx.wizard.state.referrer
            );
            if (ctx.wizard.state.referrer && referredBy) {
                user.referredBy = ctx.wizard.state.referrer;
                referredBy.referrals += 1;
                await ctx.telegram.sendMessage(
                    referredBy._id,
                    templateEngine(
                        locales.find(
                            (locale) => locale.code == referredBy.language
                        ).start.invitedNewFriend,
                        ctx.chat.first_name
                    ),
                    { parse_mode: "HTML" }
                );
            }
            await user.save();
            await ctx.sendMessage(
                templateEngine(
                    language.start.reward,
                    "$" + config.rewards.signupBonus
                ),
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [["🏠 Menu"]],
                        resize_keyboard,
                        one_time_keyboard,
                    },
                }
            );
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
            await ctx.scene.leave();
        } catch (error) {
            catcher(error, ctx).catch(() => {});
        }
    },
    async (ctx) => {
        try {
            const { language } = ctx.wizard.state;
            const user = new userModel({
                _id: ctx.chat.id,
                language: language.code,
                dateCreated: Date.now(),
                phoneNumber: ctx.message.contact.phone_number,
            });
            user.balances.reward = config.rewards.signupBonus;
            const referredBy = await userModel.findById(
                ctx.wizard.state.referrer
            );
            if (ctx.wizard.state.referrer && referredBy) {
                user.referredBy = ctx.wizard.state.referrer;
                referredBy.referrals += 1;
                await ctx.telegram.sendMessage(
                    referredBy._id,
                    templateEngine(
                        locales.find(
                            (locale) => locale.code == referredBy.language
                        ).start.invitedNewFriend,
                        ctx.chat.first_name
                    ),
                    { parse_mode: "HTML" }
                );
            }
            await user.save();
            await ctx.sendMessage(
                templateEngine(
                    language.start.reward,
                    "$" + config.rewards.signupBonus
                ),
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [["🏠 Menu"]],
                        resize_keyboard,
                        one_time_keyboard,
                    },
                }
            );
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
            await ctx.scene.leave();
        } catch (error) {
            catcher(error, ctx).catch(() => {});
        }
    }
);

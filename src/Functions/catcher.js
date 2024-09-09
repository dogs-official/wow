const { Context } = require("telegraf");
const userModel = require("../Models/user.model");
const getLocales = require("./getLocales");
const getConfig = require("./getConfig");

const config = getConfig();
const locales = getLocales(config.locales);

/**
 * @param {*} error
 * @param {Context} ctx
 */
module.exports = async (error, ctx) => {
    try {
        ctx.scene.leave().catch(() => {});
        console.log(error);
        if (ctx) {
            const user = await userModel.findById(ctx.chat.id);
            const locale = locales.find(
                (locale) => locale.code == user.language
            );
            await ctx.sendMessage(locale.errors.unknownError);
        }
    } catch (error) {
        console.log(error);
    }
};

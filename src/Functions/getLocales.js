module.exports = (locales) =>
    locales.map((locale) => {
        if (locale.enabled)
            return require("../Locales/" + locale.code + ".locale.json");
    }).filter((locale) => !!locale);

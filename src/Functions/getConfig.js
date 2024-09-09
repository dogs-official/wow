module.exports = () => {
    const fs = require("node:fs");
    const JSON = require("jsonc").jsonc;
    return JSON.parse(fs.readFileSync("./src/config.jsonc", "utf8"));
};

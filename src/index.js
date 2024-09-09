require("@dotenvx/dotenvx").config();
const { default: mongoose } = require("mongoose");
const bot = require("./bot");


mongoose
    .connect(process.env.MONGODB)
    .then(() => bot.launch(() => console.log("Launched.")));

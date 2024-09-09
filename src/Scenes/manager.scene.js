const deposit = require("./deposit.scene");
const withdraw = require("./withdraw.scene");
const signup = require("./signup.scene");
const { Stage } = require("telegraf/scenes");

module.exports = new Stage([deposit, withdraw, signup]);

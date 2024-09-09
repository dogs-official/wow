const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        balances: {
            type: new mongoose.Schema({
                deposit: {
                    type: Number,
                },
                reward: {
                    type: Number,
                    required: true,
                },
            }),
            default: {
                deposit: 0,
                reward: 0,
            },
        },
        referrals: {
            type: Number,
            default: 0,
        },
        referredBy: {
            type: String,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        language: {
            type: String,
            required: true,
        },
        dateCreated: {
            type: Date,
            required: true,
        },
    },
    {
        _id: false,
    }
);

module.exports = mongoose.model("User", userSchema, "User");

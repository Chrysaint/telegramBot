const TelegramBot = require("node-telegram-bot-api");
const mongo = require("./mongo");
const token = process.env.BOT_TOKEN

const mainChatId = process.env.FIRST_CHAT;
const secondaryChatId = process.env.SECOND_CHAT;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
    if (msg.forward_from_chat) {
        bot.forwardMessage(
            secondaryChatId,
            mainChatId,
            msg.forward_from_message_id
        ).then(async (data) => {
            const msgId = data.message_id;
            const chatId = data.chat.id;

            await mongo.addMessage(chatId, msgId);
        });
    }
});

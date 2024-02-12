const { mongoose, Schema } = require("mongoose");

const url = "mongodb://localhost:27017/bot";

mongoose.connect(url);
const con = mongoose.connection;

const msgModel = mongoose.model(
    "telegram_chats",
    new Schema({ chatId: BigInt, msgId: Number }, { versionKey: false })
);

const sessionModel = mongoose.model(
    "sessions",
    new Schema({ sessionKey: String }, { versionKey: false })
);

async function addSession(key) {
    const doc = new sessionModel();

    doc.sessionKey = key;

    await doc.save();
}

async function getSession() {
    const data = await sessionModel.find({});
    return data[0]?.sessionKey;
}

async function addMessage(chatId, msgId) {
    const doc = new msgModel();

    doc.chatId = chatId;
    doc.msgId = msgId;

    await doc.save();
}

async function getData() {
    const data = await msgModel.find({});
    return data;
}

async function removeData(chatId, msgIds) {
    await msgModel.deleteMany({ chatId: chatId, msgId: { $in: msgIds } });
}

con.on("open", () => {
    console.log("connected");
});

module.exports = {
    addMessage,
    getData,
    removeData,
    addSession,
    getSession,
};

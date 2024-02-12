const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const mongo = require("./mongo");
const input = require("input");

let msgIdMap = new Map();
let msgsToDelete = [];

setInterval(async () => {
    const data = await mongo.getData();

    msgIdMap.clear();
    data.forEach((value) => {
        let mapValues = msgIdMap.get(value.chatId);
        if (!mapValues) {
            msgIdMap.set(value.chatId, [value.msgId]);
        } else {
            if (!Array(mapValues)) {
                return;
            }
            const filterMapValues = mapValues.filter((x) => x === value.msgId);
            if (!filterMapValues.length) {
                mapValues.push(value.msgId);
                msgIdMap.set(value.chatId, mapValues);
            }
        }
    });
}, 10000);

(async () => {
    stringSession = await mongo.getSession();
    const client = new TelegramClient(
        new StringSession(stringSession),
        process.env_TG_API_ID,
        process.env_TG_API_HASH,
        { connectionRetries: 5, useIPV6: true }
    );

    await client.start({
        phoneNumber: async () => await input.text("number ?"),
        password: async () => await input.text("password?"),
        phoneCode: async () => await input.text("Code ?"),
        onError: (err) => console.log(err),
    });

    if (!stringSession) {
        const sessionKey = client.session.save();
        mongo.addSession(sessionKey); // Сохранить данный ключ в базу данных.(Авторизация)
    }

    setInterval(() => {
        msgIdMap.forEach(async (msgIds, chatId) => {
            msgIds.forEach(async (msg) => {
                const result = await client.invoke(
                    new Api.messages.GetMessagesViews({
                        peer: chatId,
                        id: [msg],
                        increment: false, // Возможно нужно будет изменить на True
                    })
                );

                const postViews = result.views[0].views;
                if (postViews > 1) {
                    msgsToDelete.push(msg);
                }
            });
            console.log(msgsToDelete, msgIds);

            if (msgsToDelete.length >= 1) {
                const result = await client.invoke(
                    new Api.channels.DeleteMessages({
                        channel: chatId,
                        id: msgsToDelete,
                    })
                );

                await mongo.removeData(chatId, msgsToDelete);
                msgsToDelete = [];
            }
        });
    }, 5000);
})();

const TelegramBotApi = require("node-telegram-bot-api");
const RoamResearchPrivateApi = require("roam-research-private-api");

const generatorValidator = (id) => {
  return (/** @type {TelegramBotApi.Message} */ message) => {
    if (message.from.id === id) return true;
    return false;
  };
};

class RoamApi extends RoamResearchPrivateApi {
  async appendBlock(text, order = 0, uid) {
    const result = await this.page.evaluate(
      (text, order, uid) => {
        if (!window.roamAlphaAPI) {
          return Promise.reject("No Roam API detected");
        }
        const result = window.roamAlphaAPI.createBlock({
          location: { "parent-uid": uid, order },
          block: { string: text },
        });
        return Promise.resolve(result);
      },
      text,
      order,
      uid
    );
    // Let's give time to sync.
    await this.page.waitForTimeout(1000);
    return result;
  }
}

module.exports = async ({
  token,
  adminId,
  roam: { graph, email, password },
}) => {
  if (typeof adminId === "string") adminId = parseInt(adminId);

  const bot = new TelegramBotApi(token, { polling: true });
  const validator = (message) => {
    if (message.from.id == adminId) return true;
    return false;
  };
  const roam = new RoamApi(graph, email, password, {
    headless: true,
  });

  await roam.logIn();
  console.log("Logged into Roam");

  bot.onText(/\/id*(.+)/, (message) => {
    bot.sendMessage(
      message.chat.id,
      `User id: ${message.from.id}\nChat id: ${message.chat.id}`
    );
  });

  bot.onText(/\/add (.+)/, (message) => {
    const chatId = message.chat.id;
    if (validator(message)) {
      const dailyNoteId = roam.dailyNoteUid();
      const dailyNoteTitle = roam.dailyNoteTitle();

      roam
        .runQuery(
          `[ :find (pull ?e [*]) :where [?e :node/title "${dailyNoteTitle}"]]`
        )
        .then((result) => {
          return result[0][0].children.length;
        })
        .then((order) => {
          console.log(order);
          roam
            .appendBlock(
              message.text.replace(/\/add /, ""),
              order ?? 0,
              dailyNoteId
            )
            .then((result) => {
              console.log(result);
              if (result) {
                bot.sendMessage(chatId, `Added text to Roam Daily Notes`);
              } else {
                bot.sendMessage(
                  chatId,
                  `Failed to add message to Roam Daily Notes`
                );
              }
            })
            .catch((err) => {
              bot.sendMessage(
                chatId,
                `Failed to add message to Roam Daily Notes.\n${err.toString()}`
              );
            });
        })
        .catch((err) => {
          bot.sendMessage(
            chatId,
            `Failed to add message to Roam Daily Notes.\n${err.toString()}`
          );
        });
    } else {
      console.log(message.from.id);
      bot.sendMessage(chatId, "Invalid user.");
    }
  });
};

const SocketListener = require("../SocketListener.js");
const redis = require("../redis/index.js");
const ftSearch = require("../utils/ftSearch.js");
const echoSocket = require("../echoSocket.js");

// FT.CREATE CVUsers ON JSON PREFIX 1 CV:Users: SCHEMA $.channelId AS channelId TAG

module.exports = new SocketListener({
  name: "set",
  async execute(socket, data, other) {
    if (!Array.isArray(data)) throw "Invalid shape!";
    if (data[0] !== null && typeof data[0] !== "string") throw "Invalid shape!";

    let oldChannelId = (await redis.json.get(`CV:Users:${socket.data.id}`, "$"))?.channelId;

    if (oldChannelId) {
      let oldUsers = await ftSearch("CVUsers", `@channelId:{${oldChannelId}}`, 1000);
      let oldUserIds = oldUsers.documents.map(i => i.value.userId);

      echoSocket.emit("CV:Update", {
        userIds: oldUserIds,
        channelId: oldChannelId,
        targetUserId: socket.data.id,
        type: "leave"
      });
    }

    let newChannelId = data[0];

    await redis.json.set(`CV:Users:${socket.data.id}`, "$", { channelId: newChannelId, userId: socket.data.id });
    redis.expire(`CV:Users:${socket.data.id}`, 60 * 60 * 6);

    if (newChannelId) {
      let newUsers = await ftSearch("CVUsers", `@channelId:{${newChannelId}}`, 1000);
      let newUserIds = newUsers.documents.map(i => i.value.userId);

      echoSocket.emit("CV:Update", {
        userIds: newUserIds,
        channelId: newChannelId,
        targetUserId: socket.data.id,
        type: "join"
      });
    }

    let result = await ftSearch("CVUsers", `@channelId:{${data[0]}}`, 1000);
    return result.documents.map(i => i.value.userId);
  }
})
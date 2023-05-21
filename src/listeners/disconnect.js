const SocketListener = require("../SocketListener.js");
const redis = require("../redis/index.js");
const ftSearch = require("../utils/ftSearch.js");

module.exports = new SocketListener({
  name: "disconnect",
  async execute(socket) {
    let senderId = socket.data.id;
    if (!senderId) return;

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
  }
})
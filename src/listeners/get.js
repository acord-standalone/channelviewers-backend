const SocketListener = require("../SocketListener.js");
const ftSearch = require("../utils/ftSearch.js");

// FT.CREATE CVUsers ON JSON PREFIX 1 CV:Users: SCHEMA $.channelId AS channelId TAG

module.exports = new SocketListener({
  name: "get",
  async execute(socket, data, other) {
    if (!Array.isArray(data)) throw "Invalid shape!";
    let result = await ftSearch("CVUsers", `@channelId:{${data[0]}}`, 1000);
    return result.documents.map(i => i.value.userId);
  }
})
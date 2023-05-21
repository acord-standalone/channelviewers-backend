const echoSocket = require('socket.io-client').io("http://localhost:2000");

module.exports = echoSocket;
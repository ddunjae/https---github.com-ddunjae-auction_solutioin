const SocketServer = require("socket.io");
let io;
class SocketUtils {
  static init(app, host, socketPort) {
    console.log("init socket", socketPort);
    if (io) return;
    try {
      const server = app.listen(socketPort, function () {
        console.log(`Socket is listening on ${host}:${socketPort}`);
      });
      io = new SocketServer.Server(server, {
        cors: {
          origin: "*",
          // methods: ["GET"]
          // allowedHeaders: ["header"],
          // credentials: true
        },
        // reconnection: true
      });

      io.on("connection", (socket) => {
        console.log(`connected...`, socket.id);
        socket.on("disconnect", (reason) => {
          console.log(`[${reason}]disconnect...`, socket.id);
        });
      });

      setInterval(() => {
        try {
          console.log("number sockets connection:", io.engine.clientsCount);
        } catch (e) {
          console.log(e);
        }
      }, 1000000);
    } catch (error) {
      console.log(error);
    }
  }
  static emitToAll(eventName, data) {
    try {
      io.emit(eventName, data);
    } catch (e) {
      console.log(e);
    }
  }
}

export default SocketUtils;

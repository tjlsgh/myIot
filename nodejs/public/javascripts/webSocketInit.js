function webSocketInit(host, msgHandle) {
  let socket;
  if (!window.WebSocket) {
    window.WebSocket = window.MozWebSocket;
  }
  if (window.WebSocket) {
    socket = new WebSocket("ws://" + host);
    setSocketOption(socket);
  } else {
    alert("your Browser do not support websocket!");
  }

  function setSocketOption(socket) {
    socket.onmessage = function (msg) {
      console.log("------ websocket receive: " + msg.data);
      try {
        msgHandle(msg);
      } catch (err) {
        console.log(err);
      }
    };
    socket.onopen = function (event) {
      console.log("------ websocket connected");
      let data = JSON.stringify({ deviceId: deviceId });
      socket.send(data);
    };
    socket.onclose = function (event) {
      console.log("------ websocket closed");
    };

    socket.onerror = function (event) {
      console.log("------ websocket error:", event);
    };
  }
}

module.exports = {
  webSocketInit: webSocketInit,
};

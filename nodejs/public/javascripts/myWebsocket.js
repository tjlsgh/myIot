function myWebSocket(host, msgHandle, openHandle, deviceId) {
  this.host = host;
  this.deviceId = deviceId;
  //this.socket;
  let socket;
  this.init = function () {
    if (!window.WebSocket) {
      window.WebSocket = window.MozWebSocket;
    }
    if (window.WebSocket) {
      socket = new WebSocket("ws://" + this.host);
      console.log("--- this host: " + this.host);
      setSocketOption(socket);
      console.log("--- socket init");
      //this.socket = socket;
    } else {
      alert("your Browser do not support websocket!");
    }
  };
  // 发送请求历史数据命令
  this.sendHistoryDataReq = function (message, callback) {
    this.waitForConnection(function () {
      socket.send(message);
      // console.log("0.0.0.0.0.0.0.")
      if (typeof callback !== "undefined") {
        callback();
      }
    }, 1000);
  };
  // 等待连接，成功则执行回调函数，否则递归调用函数
  this.waitForConnection = function (callback, interval) {
    if (socket.readyState === 1) {
      callback();
    } else {
      let that = this;
      setTimeout(function () {
        that.waitForConnection(callback, interval);
      }, interval);
    }
  };
  this.getSocket = function () {
    return this.socket;
  };
  function setSocketOption(socket) {
    socket.onmessage = function (msg) {
      console.log("--- websocket receive: " + msg.data);
      try {
        msgHandle(msg);
      } catch (err) {
        console.log("--- " + err);
      }
    };
    socket.onopen = function (event) {
      console.log("--- websocket connected");
      // let data = JSON.stringify({ deviceId: deviceId });
      // socket.send(data);
      openHandle(socket);
    };
    socket.onclose = function (event) {
      console.log("--- websocket closed");
    };

    socket.onerror = function (event) {
      console.log("--- websocket error:", event);
    };
    return socket;
  }
}

module.exports = {
  myWebSocket: myWebSocket,
};

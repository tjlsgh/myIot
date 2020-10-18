const WebSocket = require("ws");
const moment = require("moment");
const wsList = []; // 保存 deviceId 和 websocket

function addWebsocket(deviceId, ws) {
  wsList.push({ deviceId: deviceId, ws: ws });
}
function deleteWebsocket(ws) {
  let wsIndex;
  wsList.forEach((value, index) => {
    if (value.ws === ws) {
      wsIndex = index;
    }
  });
  if (wsIndex) {
    wsList.splice(wsIndex, 1);
    console.log("delete WebSocket:", ws.ip);
  }
}
// 类型: 0 设备数据 1 设备回复
function sendData(deviceId, data) {
  let msg;
  // 判断 返回
  if (typeof data == "undefined") return;
  // if (data == "OK") {
  //   //return console.log("device receive message OK");
  //   msg = [{ type: 1, deviceRes: OK }]; // 设备接收到消息
  // } else {
    // 捕捉序列化时的异常
    try {
      data = JSON.parse(data);
      msg = JSON.stringify([
        { time: moment().format("mm:ss"), value: data },
      ]);
    } catch (error) {
      return console.log("JSON.stringfy err");
    }
  //}
  wsList.forEach((v) => {
    if (v.deviceId === deviceId) {
      if (v.ws.readyState === WebSocket.OPEN) {
        v.ws.send(msg);
        // console.log("!!!!!!" + msg);
      } else {
        // 将不在连接状态的websocket删除
        return deleteWebsocket(v.ws);
      }
    }
  });
}
function init(server) {
  const wss = new WebSocket.Server({ server });
  console.log("server websocket created");
  wss.on("connection", (ws, req) => {
    ws.ip = req.connection.remoteAddress;
    console.log("websocket connected: ip =" + ws.ip);
    ws.on("message", (msg) => {
      console.log("websocket received: %s", msg);
      try {
        let data = JSON.parse(msg);
        // 如果有 websocket 连入，将 deviceId 放入 wsList 中
        if (data.deviceId) {
          addWebsocket(data.deviceId, ws);
        }
      } catch (error) {
        console.log("websocket err: ", error);
      }
    });
    ws.on("close", () => {
      deleteWebsocket(ws);
      console.log("websocket close.");
    });

    ws.on("error", (err) => {
      deleteWebsocket(ws);
      console.log("websocket error.", err);
    });
  });
}
module.exports = {
  init: init,
  sendData: sendData,
};

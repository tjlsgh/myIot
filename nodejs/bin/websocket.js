const WebSocket = require("ws");
const moment = require("moment");
const devicesList = require("./common.js").devicesList;
const wsList = []; // 保存已连接的 websocket
let mongodb = require("./mongodb.js");
function init(server) {
  const wss = new WebSocket.Server({ server });

  console.log("--- server websocket created");
  wss.on("connection", (ws, req) => {
    ws.ip = req.connection.remoteAddress;
    console.log("--- websocket connected: ip =" + ws.ip);

    // 有浏览器请求 发送每个连接的设备状态
    sendState(ws);
    ws.on("message", (msg) => {
      console.log("--- websocket received: %s", msg);
      try {
        let data = JSON.parse(msg);
        // 请求历史数据 查找数据库
        if (data.req == "historyData") {
          console.log("--- received request history data");
          mongodb.find({ id: data.id }, (err, result) => {
            if (err) {
              res.send("some error happend");
              console.log("--- router /history/:id error " + err);
            } else {
              let historyData = [];
              result.forEach((e) => {
                historyData.push({
                  time: moment(e.createAt).format("kk:mm:ss"),
                  value: e.data,
                });
              });
              historyData.reverse();
              msg = JSON.stringify({ type: "historyData", value: historyData });
              ws.send(msg);
            }
          });
        } else if (data.deviceId) { // 将设备id和此websocket保存
          addWebsocket(data.deviceId, ws);
        }
      } catch (error) {
        console.log("--- websocket err: ", error);
      }
      // // 如果请求历史数据则发送
      // if (msg == "historydata") {
      //   mongodb.find({ id: req.params.id }, (err, result) => {
      //     if (err) {
      //       res.send("some error happend");
      //       console.log("router /history/:id error " + err);
      //     } else {
      //       let historyData = [];
      //       result.forEach((e) => {
      //         historyData.push({
      //           time: moment(e.createAt).format("mm:ss"),
      //           value: e.data,
      //         });
      //       });
      //       historyData.reverse();
      //       msg = JSON.stringify({type:historyData,value:historyData});
      //       ws.send(msg);
      //     }
      //   });
      //   return;
      // }
      // try {
      //   let data = JSON.parse(msg);
      //   // 如果有 websocket 连入，将 deviceId 放入 wsList 中
      //   if (data.deviceId) {
      //     addWebsocket(data.deviceId, ws);
      //   }
      // } catch (error) {
      //   console.log("****** websocket err: ", error);
      // }
    });
    ws.on("close", () => {
      deleteWebsocket(ws);
      console.log("--- websocket close.");
    });

    ws.on("error", (err) => {
      deleteWebsocket(ws);
      console.log("--- websocket error.", err);
    });
  });
}
// 发送数据 类型: 0 设备数据 1 设备回复
function sendData(deviceId, data) {
  let msg;
  // 判断 返回
  if (typeof data == "undefined") return;

  try {
    data = JSON.parse(data);
    msg = JSON.stringify([{ time: moment().format("mm:ss"), value: data }]);
  } catch (error) {
    return console.log("--- JSON stringfy err");
  }

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
// 发送状态
function sendState(ws) {
  devicesList.forEach((connection) => {
    console.log(
      "--- send state:  Id: " + connection.id,
      " light1: " + connection.devices.light1
    );
    let deviceState = JSON.stringify([
      {
        time: moment().format("mm:ss"),
        value: { type: 1, devices: connection.devices },
      },
    ]);
    ws.send(deviceState);
  });
}
// 添加 websocket
function addWebsocket(deviceId, ws) {
  wsList.push({ deviceId: deviceId, ws: ws });
}
// 删除 websocket
function deleteWebsocket(ws) {
  let wsIndex;
  wsList.forEach((value, index) => {
    if (value.ws === ws) {
      wsIndex = index;
    }
  });
  if (wsIndex) {
    wsList.splice(wsIndex, 1);
    console.log("--- delete WebSocket:", ws.ip);
  }
}
module.exports = {
  init: init,
  sendData: sendData,
};

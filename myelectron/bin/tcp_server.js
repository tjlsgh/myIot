const net = require("net");
const mongodb = require("./mongodb.js");
const devicesList = require("./common.js").devicesList;
const { ipcMain } = require("electron");
const moment = require("moment");
let PORT = "8266"; // 监听端口
let Timeout = 10 * 1000; // 10秒没发送数据则断开
let subscribeDevId = null; // 订阅设备ID
let subscribeEvent = null;
// 监听订阅事件
ipcMain.on("subscribeDev", (event, arg) => {
  // console.log("--- " + arg);
  subscribeEvent = event;
  subscribeDevId = arg;
});
// 监听控制设备的事件
ipcMain.on("controlDev", (event, arg) => {
  // console.log("--- " + arg.id, arg.action);
  sendCommand(arg.id, arg.action);
});

const server = net.createServer((connection) => {
  console.log("--- client connected");
  let address =
    connection.address().address + "  port:" + connection.remotePort;
  console.log("--- address: " + address);

  connection.on("data", (data) => {
    // 此连接没有id 则保存
    if (!connection.id) {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.log("--- tcp data parse error");
      }
      // 将设备发送的数据ID保存为连接的ID
      //console.log(data)
      connection.id = data.Id;
      connection.devices = data.devices;
      connection.addr = address;
      console.log("--- deviceId: " + connection.id);
      // 保存此连接
      addDevice(connection);
      connection.write("OK", "ascii");
      //websocket.sendData(connection.id, JSON.stringify(data));
      if (connection.id === subscribeDevId) {
        subscribeEvent.sender.send("deviceState", [
          { time: moment().format("mm:ss"), value: data }
        ]);
      }
      return;
    } else {
      // 已保存 id 则将数据保存到数据库中
      mongodb.insert(
        { id: connection.id, data: connection.lastValue },
        (err) => {
          if (err) {
            console.log("--- insert data err", err);
          }
        }
      );
      // websocket.sendData(connection.id, connection.lastValue);
      // 如果连接的id 等于订阅设备的id 则发送数据
      if (connection.id === subscribeDevId) {
        subscribeEvent.sender.send("deviceData", [
          { time: moment().format("mm:ss"), value: connection.lastValue },
        ]);
      }
    }

    let str = address + " receive: " + data.toString("ascii");
    connection.lastValue = data.toString("ascii");
    console.log("--- " + str);
  });

  // 停止连接
  connection.on("end", function () {
    console.log("--- connection end");
    deleteDevice(connection);
  });
  // 关闭连接
  connection.on("close", () => {
    console.log("--- " + address, connection.id, "close");
    deleteDevice(connection);
  });
  // 连接错误
  connection.on("error", () => {
    console.log("--- " + address, connection.id, "error");
    deleteDevice(connection);
  });

  // 设置连接时间，超出时间断开
  connection.setTimeout(Timeout);
  connection.on("timeout", () => {
    console.log("--- " + address, connection.id, "time out");
    connection.end();
  });
});
server.listen(PORT, () => {
  console.log("--- server is listening");
});

// 添加设备
function addDevice(connection) {
  deleteDevice(connection);
  devicesList.push(connection);
}
// 删除设备
function deleteDevice(connection) {
  if (connection.id && connection.addr) {
    let cIndex = null;
    devicesList.forEach((value, index) => {
      if (value.id === connection.id && value.addr === connection.addr) {
        cIndex = index;
      }
    });
    if (cIndex != null) {
      devicesList.splice(cIndex, 1);
    }
  }
}
// 查找设备
function findDevice(connection) {
  let newDevicesList = [];
  devicesList.forEach((element) => {
    if (element.id === connection.id && element.addr === connection.addr) {
      newDevicesList.push(element);
    }
  });
  return newDevicesList;
}
// 根据ID查找设备
function findDeviceById(id) {
  let newDevicesList = [];
  devicesList.forEach((element) => {
    if (element.id === id) {
      newDevicesList.push(element);
    }
  });
  return newDevicesList;
}
// 发送命令
function sendCommand(id, command) {
  let devices = findDeviceById(id);
  if (devices.length === 0) {
    return;
  }
  devices.forEach((connection) => {
    connection.write(command, "ascii");
  });
}

module.exports = {
  sentCommand: sendCommand,
  subscribeDevId: subscribeDevId,
};

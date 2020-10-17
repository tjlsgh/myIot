var net = require("net");
//const { Socket } = require("dgram");
const mongodb = require("./mongodb.js");
const websocket = require("./websocket");
const deviceList = [];
const PORT = "8266";
const Timeout = 10 * 1000;

var server = net.createServer((connection) => {
  console.log("client connected");
  let address = connection.address().address + "  port:" + connection.remotePort;
  console.log("address: " + address);
  connection.on("data", (data) => {
    // 设备 ID
    if (!connection.id) {
      connection.id = data.toString("ascii");
      connection.addr = address;
      console.log("device id : " + connection.id);
      addDevice(connection);
      return;
    } else {
      mongodb.insert(
        { id: connection.id, data: connection.lastValue },
        (err) => {
          if (err) {
            console.log("insert data err", err);
          }
        }
      );
      websocket.sendData(connection.id, connection.lastValue);
      console.log("websocket sendData:" +connection.id+ " " + connection.lastValue)
    }
    let str = address + " receive: " + data.toString("ascii");
    connection.lastValue = data.toString("ascii");
    console.log(str);
  });

  // 关闭连接
  connection.on("end", function () {
    console.log("客户端关闭连接");
  });

  connection.on("close", () => {
    console.log(address, connection.id, "close");
  });

  connection.on("error", () => {
    console.log(address, connection.id, "error");
  });

  // 设置连接时间，超出时间断开
  connection.setTimeout(Timeout);
  connection.on("timeout", () => {
    console.log(address, connection.id, "time out");
    connection.end();
  });
});
server.listen(PORT, () => {
  console.log("server is listening");
});

function addDevice(connection) {
  deleteDevice(connection);
  deviceList.push(connection);
}
function deleteDevice(connection) {
  if (connection.id && connection.addr) {
    let cIndex = null;
    deviceList.forEach((value, index) => {
      if (value.id === connection.id && value.addr === connection.addr) {
        cIndex = index;
      }
    });
    if (cIndex != null) {
      deviceList.splice(cIndex, 1);
    }
  }
}
function findDevice(connection) {
  let newDeviceList = [];
  deviceList.forEach((element) => {
    if (element.id === connection.id && element.addr === connection.addr) {
      newDeviceList.push(element);
    }
  });
  return newDeviceList;
}
function findDeviceById(id) {
  let newDeviceList = [];
  deviceList.forEach((element) => {
    if (element.id === id) {
      newDeviceList.push(element);
    }
  });
  return newDeviceList;
}
function sendCommand(id, command) {
  let divices = findDeviceById(id);
  if (device.length === 0) {
    return;
  }
  if (command === "open") {
    deviceList.forEach((connection) => {
      connection.write("1", "ascii");
    });
  } else if (command === "close") {
    deviceList.forEach((connection) => {
      connection.write("0", "ascii");
    });
  }
}

module.exports = {
  sentCommand: sendCommand,
};

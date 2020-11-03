var net = require("net");
const mongodb = require("./mongodb.js");
const websocket = require("./websocket");
const devicesList = require("./common.js").devicesList;
const PORT = "8266";
const Timeout = 5 * 1000;

var server = net.createServer((connection) => {
  console.log("--- client connected");
  let address =
    connection.address().address + "  port:" + connection.remotePort;
  console.log("--- address: " + address);

  connection.on("data", (data) => {
    // 设备 ID
    if (!connection.id) {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.log("--- tcp data parse error");
      }
      connection.id = data.Id;
      connection.devices = data.devices;
      connection.addr = address;
      console.log(
        "--- deviceId: " +
          connection.id 
          // " light1: " +
          // connection.devices.light1 +
          // " relay1: " +
          // connection.devices.relay1
      );
      addDevice(connection);
      connection.write("OK", "ascii");
      websocket.sendData(connection.id, JSON.stringify(data));
      return;
    } else {
      mongodb.insert(
        { id: connection.id, data: connection.lastValue },
        (err) => {
          if (err) {
            console.log("--- insert data err", err);
          }
        }
      );
      websocket.sendData(connection.id, connection.lastValue);
    }

    let str = address + " receive: " + data.toString("ascii");
    connection.lastValue = data.toString("ascii");
    console.log("--- " + str);
  });

  // 关闭连接
  connection.on("end", function () {
    console.log("--- 客户端关闭连接");
    deleteDevice(connection);
  });

  connection.on("close", () => {
    console.log("--- " + address, connection.id, "close");
    deleteDevice(connection);
  });

  connection.on("error", () => {
    console.log("--- " + address, connection.id, "error");
    deleteDevice(connection);
  });

  // 设置连接时间，超出时间断开
  connection.setTimeout(Timeout);
  connection.on("timeout", () => {
    console.log("--- " + address, connection.id, "time out");
    connection.end();
    deleteDevice(connection);
  });
});
server.listen(PORT, () => {
  console.log("--- server is listening");
});

function addDevice(connection) {
  deleteDevice(connection);
  devicesList.push(connection);
}
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
function findDevice(connection) {
  let newDevicesList = [];
  devicesList.forEach((element) => {
    if (element.id === connection.id && element.addr === connection.addr) {
      newDevicesList.push(element);
    }
  });
  return newDevicesList;
}
function findDeviceById(id) {
  let newDevicesList = [];
  devicesList.forEach((element) => {
    if (element.id === id) {
      newDevicesList.push(element);
    }
  });
  return newDevicesList;
}
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
  devicesList: devicesList,
  sentCommand: sendCommand,
};

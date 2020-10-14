var net = require("net");
const { Socket } = require("dgram");
const PORT = "8266";
const Timeout = 10 * 1000;

var server = net.createServer((connection) => {
  console.log("client connected");
  let address = connection.address().address + " : " + connection.remotePort;
  console.log("address: " + address);
  connection.on("data", (data) => {
    if (!connection.id) {
      connection.id = data.toString("ascii");
      connection.addr = address;
      console.log('device id : ' + connection.id);
      return;
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

  connection.setTimeout(Timeout);
  connection.on("timeout", () => {
    console.log(address, connection.id, "time out");
    connection.end();
  });
});
server.listen(PORT, () => {
  console.log("server is listening");
});

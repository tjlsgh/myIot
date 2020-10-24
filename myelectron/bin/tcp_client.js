const net = require("/net");

function tcp_client() {
  this.init = function () {
    let client = net.createConnection({ port: 8266 }, () => {
      console.log("--- tcp client connected server !");
      client.write("mydevice1");
      let interval = setInterval(() => {
        if (client.destroyed) {
          clearInterval(interval);
        } else {
          client.write("");
        }
      }, 1000);
    });
    client.on("data", (data) => {
      console.log("--- tcp client received: " + data);
    });
    client.on("close", () => {
      console.log("--- tcp client closed");
    });
  };
}

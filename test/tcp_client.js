const net = require("net");

let client = net.createConnection({ port: 8266 }, () => {
  console.log("--- tcp client connected server !");
  client.write(
    '{"type": 1,"Id": "sensor002", "devices": {"light1": 1, "relay1": 1}}'
  );
  let interval = setInterval(() => {
    if (client.destroyed) {
      clearInterval(interval);
    } else {
      let temp = (20 + Math.random() * 10).toFixed(2);
      let humi = (50 + Math.random() * 10).toFixed(2);
      client.write(
        '{"type": 0, "temp": ' + temp + ', "humi": ' + humi + ',  "light1": 0}'
      );
    }
  }, 1000);
});
client.on("data", (data) => {
  console.log("--- tcp client received: " + data);
});
client.on("close", () => {
  console.log("--- tcp client closed");
});
client.on("error", () => {
  console.log("--- tcp client error");
});

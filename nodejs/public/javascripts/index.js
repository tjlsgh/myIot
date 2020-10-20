// 浏览器不识别require  需要 npm install -g browserify   通过browserify打包模块
const MyEchart = require("./echartInit.js");
const Mywebsocket = require("./webSocketInit.js");
var tempChart, humiChart;
const host = window.location.host;
const deviceId = window.location.pathname.split("/")[2] || "mydevice1";
let devData = 0,
  devState = 1;
const reqCommand = {
  closeLed: "0",
  openLed: "1",
  checkDevState: "2",
};
window.onload = function () {
  Mywebsocket.init(host, msgHandle, deviceId);
  checkDevState();
  tempChart = MyEchart.init(tempChart, "tempEchartBox");
  humiChart = MyEchart.init(humiChart, "humiEchartBox");
  console.log("my chart init");
};
window.addEventListener("beforeunload", function (event) {
  console.log("I am the 2nd one.");
});
window.addEventListener("unload", function (event) {
  console.log("I am the 4th and last one");
});

// 解析websocket收到的数据类型
function msgHandle(msg) {
  let data = JSON.parse(msg.data);
  data.forEach((e) => {
    if (e.value.type === devData) {
      MyEchart.drawChart(e, tempChart, tempChartOption, "temp");
      MyEchart.drawChart(e, humiChart, humiChartOption, "humi");
    } else if (e.value.type === devState) {
      console.log("stateHandle......");
      setState(e.value.devices);
    }
  });
}
// 设置设备状态
function setState(devices) {
  // let eleClass = "." + device; // 元素 类名
  console.log("dev res");
  for (let key in devices) {
    if (key == "light1") {
      setStateHelper(key, devices);
    }
    if (key == "relay1") {
      setStateHelper(key, devices);
    }
  }
}
// 帮助判断
function setStateHelper(key, devices) {
  switch (devices[key]) {
    case 0:
      $("." + key).text("关闭");
      break;
    case 1:
      $("." + key).text("开启");
      break;
    case 2:
      $("." + key).text("未知");
      break;
  }
}
// 发送查看设备状态的命令
function checkDevState() {
  $.post("/checkDevState/" + deviceId, { action: reqCommand.checkDevState });
  console.log("check device state");
}
// 处理按钮的请求事件
$("#led-open").click(() => {
  $.post("/led/" + deviceId, { action: reqCommand.openLed });
  console.log("led open");
});
$("#led-close").click(() => {
  console.log("led close");
  $.post("/led/" + deviceId, { action: reqCommand.closeLed });
});

var tempChartOption = {
  xAxis: {
    type: "category",
    data: [],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      data: [],
      type: "line",
      smooth: true,
    },
  ],
  title: {
    text: "实时温度",
    left: "center",
    textStyle: {
      color: "#eaaead",
    },
  },
  textStyle: {
    color: "#fff",
    fontWeight: "normal",
    fontSize: 20,
  },
};
var humiChartOption = {
  xAxis: {
    type: "category",
    data: [],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      data: [],
      type: "line",
      smooth: true,
    },
  ],
  title: {
    text: "实时湿度",
    left: "center",
    textStyle: {
      color: "#eaaead",
    },
  },
  textStyle: {
    color: "#fff",
    fontWeight: "normal",
    fontSize: 20,
  },
};

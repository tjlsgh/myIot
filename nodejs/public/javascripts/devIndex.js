// 浏览器不识别require  需要安装 npm install -g browserify   通过browserify打包模块 browserify devIndex.js -o myDevIndex.js
//const MyEchart = require("./echartInit.js");
//const Mywebsocket = require("./webSocketInit.js");
const mywebsocket = require("./myWebsocket").myWebSocket;
const myEchart = require("./myEchart").myEchart;
var tempChart, humiChart;
const host = window.location.host;
const deviceId = window.location.pathname.split("/")[2] || "mydevice1";
let devData = 0,
  devState = 1; // 标识状态、数据
let MinMaxAvgData = [];
let dataEleClass = [
  // 标记元素， 用于更改数据显示
  ".MinTemp",
  ".MaxTemp",
  ".AvgTemp",
  ".MinHumi",
  ".MaxHumi",
  ".AvgHumi",
];
const reqCommand = {
  closeLed: "0",
  openLed: "1",
  checkDevState: "2",
};

window.onload = function () {
  //Mywebsocket.init(host, msgHandle, deviceId);
  mws = new mywebsocket(host, msgHandle, openHandle, deviceId);
  mws.init();
  // tempChart = mws.init(tempChart, "tempEchartBox");
  // humiChart = mws.init(tempChart, "humiEchartBox");
  checkDevState();
  //tempChart = MyEchart.init(tempChart, "tempEchartBox");
  //humiChart = MyEchart.init(humiChart, "humiEchartBox");

  mec = new myEchart();
  tempChart = mec.init(tempChart, "tempEchartBox");
  humiChart = mec.init(tempChart, "humiEchartBox");
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
      mec.drawLineChart(e, tempChart, tempChartOption, "temp");
      mec.drawLineChart(e, humiChart, humiChartOption, "humi");
      setMinMaxAvg(e.value);
    } else if (e.value.type === devState) {
      console.log("stateHandle......");
      setDevState(e.value.devices);
    }
  });
}
function openHandle(socket) {
  let data = JSON.stringify({ deviceId: deviceId });
  socket.send(data);
}
// 设置设备状态
function setDevState(devices) {
  // let eleClass = "." + device; // 元素 类名
  console.log("------ set states");
  for (let key in devices) {
    if (key == "light1") {
      setDevStateHelper(key, devices);
    }
    if (key == "relay1") {
      setDevStateHelper(key, devices);
    }
  }
}
// 好蠢的写法呀 QAQ
function setMinMaxAvg(value) {
  if (MinMaxAvgData.length == 0) {
    console.log("init minmaxavgdata");
    for (let i = 0; i < 3; i++) MinMaxAvgData[i] = value.temp;
    for (let i = 3; i < 6; i++) MinMaxAvgData[i] = value.humi;
    for (let i = 0; i < 6; i++) {
      $(dataEleClass[i]).text(MinMaxAvgData[i] + " ");
    }
  } else {
    if (value.temp < MinMaxAvgData[0]) {
      MinMaxAvgData[0] = value.temp;
      $(dataEleClass[0]).text(MinMaxAvgData[0] + " ");
    } else if (value.temp > MinMaxAvgData[1]) {
      MinMaxAvgData[1] = value.temp;
      $(dataEleClass[1]).text(MinMaxAvgData[1] + " ");
      $(dataEleClass[2]).text((MinMaxAvgData[0] + MinMaxAvgData[1]) / 2 + " ");
    }
    if (value.humi < MinMaxAvgData[3]) {
      MinMaxAvgData[3] = value.humi;
      $(dataEleClass[3]).text(MinMaxAvgData[3] + " ");
    } else if (value.humi > MinMaxAvgData[4]) {
      MinMaxAvgData[4] = value.humi;
      $(dataEleClass[4]).text(MinMaxAvgData[4] + "");
      $(dataEleClass[5]).text((MinMaxAvgData[3] + MinMaxAvgData[4]) / 2 + " ");
    }
  }
}

// 帮助判断
function setDevStateHelper(key, devices) {
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
  console.log("send: led open");
});
$("#led-close").click(() => {
  $.post("/led/" + deviceId, { action: reqCommand.closeLed });
  console.log("send: led close");
});
$("#history-inquire").click(() => {
  console.log(window.location.href);
  // window.location.href = (window.location.href.split("/")[4]);
  window.location.href = window.location.href.replace("device", "history")
  // $.get("/history/" + deviceId, {action: "jumpToHistoryIndex"});
  // console.log("jump: historyIndex")
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

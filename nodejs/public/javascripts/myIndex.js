(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function init(echart, eleId) {
  echart = echarts.init(document.getElementById(eleId));
  //setOptions();
  return echart;
}

// 设置参数
function setOptions(time, value, echart, echartOption) {
  // 判断 value 是否数字
  if (!$.isNumeric(value)) {
    return;
  }
  echartOption.xAxis.data.push(time);
  echartOption.series[0].data.push(value);
  // 最多十个数据
  if (echartOption.xAxis.data.length > 10) {
    echartOption.xAxis.data.shift();
    echartOption.series[0].data.shift();
  }
  echart.setOption(echartOption);
}

// 图表绘制
function drawChart(data, chart, chartOption, type) {
  if(type == "temp") {
    setOptions(data.time, data.value.temp, chart, chartOption);
  } else if(type == "humi") {
    setOptions(data.time, data.value.humi, chart, chartOption);
  }
  
}

module.exports = {
  init: init,
  drawChart: drawChart,
};

},{}],2:[function(require,module,exports){
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

},{"./echartInit.js":1,"./webSocketInit.js":3}],3:[function(require,module,exports){
function init(host, msgHandle, deviceId) {
  let socket;
  if (!window.WebSocket) {
    window.WebSocket = window.MozWebSocket;
  }
  if (window.WebSocket) {
    socket = new WebSocket("ws://" + host);
    setSocketOption(socket);
  } else {
    alert("your Browser do not support websocket!");
  }

  function setSocketOption(socket) {
    socket.onmessage = function (msg) {
      console.log("------ websocket receive: " + msg.data);
      try {
        msgHandle(msg);
      } catch (err) {
        console.log(err);
      }
    };
    socket.onopen = function (event) {
      console.log("------ websocket connected");
      let data = JSON.stringify({ deviceId: deviceId});
      socket.send(data);
    };
    socket.onclose = function (event) {
      console.log("------ websocket closed");
    };

    socket.onerror = function (event) {
      console.log("------ websocket error:", event);
    };
  }
}

module.exports = {
  init: init,
};

},{}]},{},[2]);

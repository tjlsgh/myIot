(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

/* 我是分界线 */
// 浏览器不识别require  需要安装 npm install -g browserify   通过browserify打包模块 browserify devIndex.js -o myDevIndex.js
//const MyEchart = require("./echartInit.js");
//const Mywebsocket = require("./webSocketInit.js");
const mywebsocket = require("./myWebsocket").myWebSocket;
const myEchart = require("./myEchart").myEchart;
var tempChart, humiChart;
const host = window.location.host;
const deviceId = window.location.pathname.split("/")[2] || "sensor001";
let devicesList = [];
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
  console.log("--- my chart init");
};
window.addEventListener("beforeunload", function (event) {
  console.log("--- I am the 2nd one.");
});
window.addEventListener("unload", function (event) {
  console.log("--- I am the 4th and last one");
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
      console.log("--- stateHandle......");
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
  console.log("--- set states");
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
    console.log("--- init minmaxavgdata");
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
      $(dataEleClass[2]).text(((MinMaxAvgData[0] + MinMaxAvgData[1]) / 2).toFixed(2) + " ");
    }
    if (value.humi < MinMaxAvgData[3]) {
      MinMaxAvgData[3] = value.humi;
      $(dataEleClass[3]).text(MinMaxAvgData[3] + " ");
    } else if (value.humi > MinMaxAvgData[4]) {
      MinMaxAvgData[4] = value.humi;
      $(dataEleClass[4]).text(MinMaxAvgData[4] + "");
      $(dataEleClass[5]).text(((MinMaxAvgData[3] + MinMaxAvgData[4]) / 2).toFixed(2) + " ");
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
  console.log("--- check device state");
}
// 处理按钮的请求事件
$("#led-open").click(() => {
  $.post("/led/" + deviceId, { action: reqCommand.openLed });
  console.log("--- send: led open");
});
$("#led-close").click(() => {
  $.post("/led/" + deviceId, { action: reqCommand.closeLed });
  console.log("--- send: led close");
});
// 跳转到历史数据页面
$("#to-historyIndex").click(() => {
  if (window.location.href.split("/")[4] == undefined)
    window.location.href = window.location.href + "history/" + deviceId;
  else window.location.href = window.location.href.replace("device", "history");
});
// 显示连接设备列表
$(".dropdown").on("show.bs.dropdown", ()=> {
  // 发送获取连接设备的请求并渲染出来
  $.get("/devicesList", (res) => {
    devicesList = res;
  })
  let html = "";
  // let id = "";
  devicesList.forEach((device,index) => {
    // console.log(device);
    let id = device.id;
    // console.log(id);
    html += '<tr><td>'+index+'</td><td>'+device.addr+
    '</td><td><button id='+id+'>'+device.id+'</button></td></tr>';
    $(".devicesList").html(html);
   
  });
  initDevClick();
})
// 点击设备列表后初始化点击按钮
function initDevClick() {
  // 跳转到某一设备页面
  for (const key in devicesList) {
    // console.log(devicesList[key]);
    let id = devicesList[key].id
    $("#"+ id).click(() => {
      // 替换字符串
      console.log("111")
      let href = window.location.href;
      if (href.split("/")[4] == undefined)
        window.location.href = href + "device/" + id;
      else {
        let lastFixIndex = href.lastIndexOf("/");
        let startIndex = lastFixIndex + 1;
        let totalLength = href.length;
        let cutLength = totalLength-startIndex;
        let cutContent = href.substr(startIndex, cutLength);
        if(cutContent == id) return;
        window.location.href = href.replace(cutContent, id);
      }
    });
  }
}

var tempChartOption = {
  xAxis: {
    type: "category",
    data: [],
  },
  yAxis: {
    type: "value",
  },
  tooltip: {
    trigger: 'axis'
  },
  toolbox: {
    show: true,
    trigger: 'axis',
  },
  series: [
    {
      name: '温度',
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
  tooltip: {
    trigger: 'axis'
  },
  toolbox: {
    show: true,
    trigger: 'axis',
  },
  series: [
    {
      name: "湿度",
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
/* 我是分界线 */


},{"./myEchart":2,"./myWebsocket":3}],2:[function(require,module,exports){
function myEchart() {
  this.init = function (echart, eleId) {
    echart = echarts.init(document.getElementById(eleId), "light");
    //setOptions();
    return echart;
  };
  this.init2 = function (eleId) {
    let echart = echarts.init(document.getElementById(eleId));
    return echart;
  };

  // 图表绘制
  this.drawLineChart = function (data, chart, chartOption, type) {
    if (type == "temp") {
      setOptions(data.time, data.value.temp, chart, chartOption);
    } else if (type == "humi") {
      setOptions(data.time, data.value.humi, chart, chartOption);
    }
  };

  this.drawBarChart = function (xAxisData, tempData, humiData, chart, chartOption) {
    setHistoryBarOptions(xAxisData, tempData, humiData, chart, chartOption);
  };
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
  function setHistoryBarOptions(xAxisData, tempData, humiData, echart, echartOption) {
    echartOption.xAxis.data = xAxisData;
    echartOption.series[0].data = tempData;
    echartOption.series[1].data = humiData;
    echart.setOption(echartOption);
  }
}

module.exports = {
  myEchart: myEchart,
};

},{}],3:[function(require,module,exports){
function myWebSocket(host, msgHandle, openHandle, deviceId) {
  this.host = host;
  this.deviceId = deviceId;
  //this.socket;
  let socket;
  this.init = function () {
    if (!window.WebSocket) {
      window.WebSocket = window.MozWebSocket;
    }
    if (window.WebSocket) {
      socket = new WebSocket("ws://" + this.host);
      console.log("--- this host: " + this.host);
      setSocketOption(socket);
      console.log("--- socket init");
      //this.socket = socket;
    } else {
      alert("your Browser do not support websocket!");
    }
  };
  // 发送请求历史数据命令
  this.sendHistoryDataReq = function (message, callback) {
    this.waitForConnection(function () {
      socket.send(message);
      // console.log("0.0.0.0.0.0.0.")
      if (typeof callback !== "undefined") {
        callback();
      }
    }, 1000);
  };
  // 等待连接，成功则执行回调函数，否则递归调用函数
  this.waitForConnection = function (callback, interval) {
    if (socket.readyState === 1) {
      callback();
    } else {
      let that = this;
      setTimeout(function () {
        that.waitForConnection(callback, interval);
      }, interval);
    }
  };
  this.getSocket = function () {
    return this.socket;
  };
  function setSocketOption(socket) {
    socket.onmessage = function (msg) {
      console.log("--- websocket receive: " + msg.data);
      try {
        msgHandle(msg);
      } catch (err) {
        console.log("--- " + err);
      }
    };
    socket.onopen = function (event) {
      console.log("--- websocket connected");
      // let data = JSON.stringify({ deviceId: deviceId });
      // socket.send(data);
      openHandle(socket);
    };
    socket.onclose = function (event) {
      console.log("--- websocket closed");
    };

    socket.onerror = function (event) {
      console.log("--- websocket error:", event);
    };
    return socket;
  }
}

module.exports = {
  myWebSocket: myWebSocket,
};

},{}]},{},[1]);

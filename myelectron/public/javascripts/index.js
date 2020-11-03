(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* 我是分界线 */
const { ipcRenderer } = nodeRequire("electron");
const myEchart = require("./myEchart.js").myEchart;
let tempChart, humiChart;
let devData = 0,
  devState = 1; // 标识状态、数据
let mec = new myEchart();
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
let reqCommand = {
  closeLed: "0",
  openLed: "1",
  checkDevState: "2",
};
// 初始化
tempChart = mec.init(tempChart, "tempEchartBox");
humiChart = mec.init(humiChart, "humiEchartBox");
// 发送设备id
subscribeDev($("#deviceId").val());

// 监听设备数据事件
ipcRenderer.on("deviceData", (event, arg) => {
  console.log("--- receive: ",arg)
  arg.forEach(e => {
    // console.log(e.time , JSON.parse(e.value).type)
    let data = {time: e.time, value: JSON.parse(e.value)};
    // console.log(data);
    if (data.value.type === devData) {
      // console.log("drawing...")
      mec.drawLineChart(data, tempChart, tempChartOption, "temp");
      mec.drawLineChart(data, humiChart, humiChartOption, "humi");
      setMinMaxAvg(data.value);
    } else if (data.value.type === devState) {
      console.log("--- stateHandle......");
      setDevState(data.value.devices);
    }
  })
});
// 监听设备状态事件
ipcRenderer.on("deviceState", (event, arg) => {
  console.log("-------- receive: ",arg)
  arg.forEach(e => {
    // console.log(e.time, e.value);
    let value = e.value;
    if(value.type == devState) {
      setDevState(value.devices);
    }
  })
})

// 处理按钮的请求事件
$("#led-open").on("click", () => {
  let deviceId = $("#deviceId").val();
  sendCommand(deviceId, reqCommand.openLed);
});
$("#led-close").on("click", () => {
  let deviceId = $("#deviceId").val();
  sendCommand(deviceId, reqCommand.closeLed);
});

// 监听设备ID
$("#deviceId").on("change",() => {
  //console.log($("#devieId").val());
  subscribeDev($("#deviceId").val());
});

// 发送订阅设备的消息
function subscribeDev(deviceId) {
  ipcRenderer.send("subscribeDev", deviceId);
}
// 发送控制设备命令的消息
function sendCommand(deviceId, action) {
  ipcRenderer.send("controlDev", { id: deviceId, action: action });
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

const tempChartOption = {
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
const humiChartOption = {
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
/* 我是分界线 */


},{"./myEchart.js":2}],2:[function(require,module,exports){
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

},{}]},{},[1]);

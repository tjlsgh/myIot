(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const mywebsocket = require("./myWebsocket").myWebSocket;
const myEchart = require("./myEchart").myEchart;
const host = window.location.host;
const deviceId = window.location.pathname.split("/")[2] || "mydevice1";
var historyChart;
var tempHistoryChart, humiHistoryChart;
var tempData = [];
var humiData = [];
window.onload = function () {
  //let socket = webSocketInit.init();
  mws = new mywebsocket(host, msgHandle, openHandle, deviceId);
  mec = new myEchart();

  mws.init();
  historyChart = mec.init(historyChart, "historyEchartBox");

  mws.sendHistoryDataReq(
    JSON.stringify({ req: "historyData", id: deviceId }),
    () => {
      console.log("-----------ok ------------");
    }
  );
};
function msgHandle(msg) {
  let data = JSON.parse(msg.data);
  if (data.type == "historyData") {
    //console.log("-+-+-+-+-+-+-+-+ "+data.value);
    let value = data.value;
    let xAxisData = [];
    let tempData = [];
    let humiData = [];
    value.forEach((e) => {
      console.log(e);
      xAxisData.push("time: " + e.time + " data");
      if (e.value !== null) {
        //console.log(e.value);
        let value = JSON.parse(e.value);
        tempData.push(value.temp);
        humiData.push(value.humi);
      }
    });
    console.log(xAxisData);
    mec.drawBarChart(
      xAxisData,
      tempData,
      humiData,
      historyChart,
      historyOption2
    );
  }
}
function openHandle(socket) {}


$("#to-deviceIndex").click(() => {
  console.log("to deviceIndex")
  if (window.location.href.split("/")[4] == undefined)
    window.location.href = window.location.href + "device/" + deviceId;
  else window.location.href = window.location.href.replace("history", "device");
});

let historyOption = {
  color: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
  title: {
    text: "历史数据",
  },
  legend: {
    data: ["temp", "humi"],
  },
  toolbox: {
    // y: 'bottom',
    feature: {
      magicType: {
        type: ["stack", "tiled"],
      },
      dataView: {},
      saveAsImage: {
        pixelRatio: 2,
      },
    },
  },
  tooltip: {},
  xAxis: {
    //data: xAxisData,
    data: [],
    splitLine: {
      show: false,
    },
  },
  yAxis: {},
  series: [
    {
      name: "temp",
      type: "bar",
      data: [],
      animationDelay: function (idx) {
        return idx * 10;
      },
    },
    {
      name: "humi",
      type: "bar",
      data: [],
      animationDelay: function (idx) {
        return idx * 10 + 100;
      },
    },
  ],
  animationEasing: "elasticOut",
  animationDelayUpdate: function (idx) {
    return idx * 5;
  },
};
let historyOption2 = {
  title: {
    text: "历史数据",
  },
  legend: {
      data: ['temp', 'humi']
  },
  toolbox: {
      // y: 'bottom',
      feature: {
          magicType: {
              type: ['stack', 'tiled']
          },
          dataView: {},
          saveAsImage: {
              pixelRatio: 2
          }
      }
  },
  tooltip: {},
  xAxis: {
      data: [],
      splitLine: {
          show: false
      }
  },
  yAxis: {
  },
  series: [{
      name: 'temp',
      type: 'bar',
      data: [],
      animationDelay: function (idx) {
          return idx * 10;
      }
  }, {
      name: 'humi',
      type: 'bar',
      data: [],
      animationDelay: function (idx) {
          return idx * 10 + 100;
      }
  }],
  animationEasing: 'elasticOut',
  animationDelayUpdate: function (idx) {
      return idx * 5;
  }
};
/* [
  { time: "52:17", value: '{"type": 0, "temp": 20, "humi": 52,  "light1": 0}' },
  { time: "52:18", value: '{"type": 0, "temp": 21, "humi": 58,  "light1": 0}' },
  { time: "52:19", value: '{"type": 0, "temp": 21, "humi": 52,  "light1": 0}' },
  { time: "52:20", value: '{"type": 0, "temp": 21, "humi": 51,  "light1": 0}' },
  { time: "52:21", value: '{"type": 0, "temp": 27, "humi": 55,  "light1": 0}' },
  { time: "52:22", value: '{"type": 0, "temp": 21, "humi": 55,  "light1": 0}' },
  { time: "52:23", value: '{"type": 0, "temp": 25, "humi": 54,  "light1": 0}' },
  { time: "52:24", value: '{"type": 0, "temp": 25, "humi": 51,  "light1": 0}' },
  { time: "52:25", value: '{"type": 0, "temp": 27, "humi": 57,  "light1": 0}' },
  { time: "52:26", value: '{"type": 0, "temp": 27, "humi": 57,  "light1": 0}' },
  { time: "52:27", value: '{"type": 0, "temp": 22, "humi": 53,  "light1": 0}' },
  { time: "52:29", value: '{"type": 0, "temp": 26, "humi": 58,  "light1": 0}' },
  { time: "37:21", value: null },
  { time: "37:22", value: '{"type": 0, "temp": 27, "humi": 57,  "light1": 0}' },
  { time: "37:23", value: '{"type": 0, "temp": 28, "humi": 59,  "light1": 0}' },
  { time: "37:43", value: null },
  { time: "37:44", value: '{"type": 0, "temp": 21, "humi": 54,  "light1": 0}' },
  { time: "37:45", value: '{"type": 0, "temp": 22, "humi": 57,  "light1": 0}' },
  { time: "37:46", value: '{"type": 0, "temp": 23, "humi": 55,  "light1": 0}' },
  { time: "37:47", value: '{"type": 0, "temp": 28, "humi": 53,  "light1": 0}' },
];
 */

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
 
    // //let socket;
    // if (!window.WebSocket) {
    //   window.WebSocket = window.MozWebSocket;
    // }
    // if (window.WebSocket) {
    //   this.socket = new WebSocket("ws://" + this.host);
    //   setSocketOption(this.socket);
    //   console.log("socket init");
    //   //this.socket = socket;
    // } else {
    //   alert("your Browser do not support websocket!");
    // }
        //let socket;
    if (!window.WebSocket) {
      window.WebSocket = window.MozWebSocket;
    }
    if (window.WebSocket) {
      socket = new WebSocket("ws://" + this.host);
      console.log("this host: " + this.host);
      setSocketOption(socket);
      console.log("socket init");
      //this.socket = socket;
    } else {
      alert("your Browser do not support websocket!");
    }
  };
  // 发送请求历史数据命令
  this.sendHistoryDataReq = function (message, callback) {
    // if(this.socket.readState === 1) {
    //   socket.send("hi,i need history data");
    // }else {
    //   console.log("not open");
    // }
    this.waitForConnection(function () {
      socket.send(message);
      console.log("0.0.0.0.0.0.0.")
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
      console.log("------ websocket receive: " + msg.data);
      try {
        msgHandle(msg);
      } catch (err) {
        console.log(err);
      }
    };
    socket.onopen = function (event) {
      console.log("------ websocket connected");
      // let data = JSON.stringify({ deviceId: deviceId });
      // socket.send(data);
      openHandle(socket);
    };
    socket.onclose = function (event) {
      console.log("------ websocket closed");
    };

    socket.onerror = function (event) {
      console.log("------ websocket error:", event);
    };
    return socket;
  }
}

module.exports = {
  myWebSocket: myWebSocket,
};

},{}]},{},[1]);

//const MyEchart = require("./echartInit.js");
//let mongodb = require("../../bin/mongodb.js");
//const moment = require("moment");
//const webSocketInit = require("./webSocketInit.js");
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

  // let historyData = [];
  // let devicdId = window.location.pathname.split("/")[2] || "mydevice1";
  // tempHistoryChart = MyEchart.init(tempHistoryChart, "tempHistoryChart");
  // mongodb.find({ id: devicdId }, (err, result) => {
  //   if (err) {
  //     console.log("history err");
  //   } else {
  //     result.forEach((e) => {
  //       historyData.push({
  //         time: moment(e.createAt).format("mm:ss"),
  //         value: e.data,
  //       });
  //     });
  //     historyData.reverse();
  //   }
  // });
  // historyData.forEach((e) => {
  //   tempData.push(e.value.temp);
  //   humiData.push(e.value.humi);
  // });
  // tempHistoryChart.setOption(historyOption);
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
      xAxisData.push("time: " + e.time);
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
      historyOption
    );
    //console.log("------------- " + value);

    // let value = data.value;
    // console.log("-+-+-+-+-+-" + value);
    // let xAxisData = [];
    // let tempData = [];
    // let humiData = [];
    // value.forEach((e) => {
    //   if(e.temp && e.humi){
    //     // xAxisData.push(e.time);
    //     // tempData.push(e.value.temp);
    //     // humiData.push(e.value.humi);
    //   }
    // });
    // console.log(xAxisData);
    // console.log(tempData);
    // console.log(humiData);
    // //mec.drawBarChart(data, chart, historyOption);
  }
  //console.log(msg)
}
function openHandle(socket) {}

let historyOption = {
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
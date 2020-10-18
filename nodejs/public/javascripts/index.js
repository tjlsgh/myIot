var tempchart, humiChart;
const host = window.location.host;
let deviceId = window.location.pathname.split("/")[2] || "mydevice1";

window.onload = function () {
  tempChart = echarts.init(document.getElementById("tempEchartBox"));
  humiChart = echarts.init(document.getElementById("humiEchartBox"));
  setOptions();
  console.log("my chart init");
  ws();
};

function ws() {
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
      console.log("websocket receive: " + msg.data);
      // let data = JSON.parse(msg.data);
      // console.log("websocket receive: " + data);
      try {
        // let data = JSON.parse(msg.data);
        // if (isDeviceRes) return;
        // data.forEach((e) => {
        //   setOptions(e.time, e.value.temp, tempChart, tempChartOption);
        //   setOptions(e.time, e.value.humi, humiChart, humiChartOption);
        // });
        dataHandle(msg);
      } catch (err) {
        console.log(err);
      }
      // msg.data.forEach((element) => {
      //   setOptions(element.time, element.value);
      // });
    };
    socket.onopen = function (event) {
      console.log("websocket connected");
      let data = JSON.stringify({ deviceId: deviceId });
      socket.send(data);
    };
    socket.onclose = function (event) {
      console.log("websocket closed");
    };

    socket.onerror = function (event) {
      console.log("websocket error:", event);
    };
  }
}

function setOptions(time, value, echart, echartOption) {
  // 判断 value 是否数字
  if (!$.isNumeric(value)) {
    return;
  }
  echartOption.xAxis.data.push(time);
  echartOption.series[0].data.push(value);
  if (echartOption.xAxis.data.length > 10) {
    echartOption.xAxis.data.shift();
    echartOption.series[0].data.shift();
  }
  echart.setOption(echartOption);
}

// 解析websocket收到的数据类型
function dataHandle(msg) {
  let data = JSON.parse(msg.data);
  data.forEach((e) => {
    if (e.value.type === 0) {
      drawChart(e);
    } else if (e.value.type === 1) {
      setState(e.value.device);
    }
  });
}
// 图表绘制
function drawChart(data) {
  setOptions(data.time, data.value.temp, tempChart, tempChartOption);
  setOptions(data.time, data.value.humi, humiChart, humiChartOption);
}
function setState(device) {
  // let eleClass = "." + device; // 元素 类名
  console.log("dev res");
  for (let key in device) {
    if (key == "light1") {
      if (device[key] == 1) $(".light1").text("开启");
      else $(".light1").text("关闭");
    }
  }
}
// 处理按钮的请求事件
$("#led-open").click(() => {
  console.log("led click");
  $.post("/led/" + deviceId, { action: "open" });
});
$("#led-close").click(() => {
  console.log("led click");
  $.post("/led/" + deviceId, { action: "close" });
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

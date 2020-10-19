var tempChart, humiChart;
const host = window.location.host;
let deviceId = window.location.pathname.split("/")[2] || "mydevice1";
let devData = 0,
  devState = 1;
const reqCommand = {
  closeLed: "0",
  openLed: "1",
  checkDevState: "2",
};
window.onload = function () {
  tempChart = echarts.init(document.getElementById("tempEchartBox"));
  humiChart = echarts.init(document.getElementById("humiEchartBox"));
  setOptions();
  console.log("my chart init");
  init();
  checkDevState();
};
window.addEventListener("beforeunload", function (event) {
  console.log("I am the 2nd one.");
});
window.addEventListener("unload", function (event) {
  console.log("I am the 4th and last one…");
  
});
function init() {
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
      try {
        dataHandle(msg);
      } catch (err) {
        console.log(err);
      }
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
    if (e.value.type === devData) {
      drawChart(e);
    } else if (e.value.type === devState) {
      console.log("stateHandle…………");
      setState(e.value.devices);
    }
  });
}
// 图表绘制
function drawChart(data) {
  setOptions(data.time, data.value.temp, tempChart, tempChartOption);
  setOptions(data.time, data.value.humi, humiChart, humiChartOption);
}
// 设置设备状态
function setState(devices) {
  // let eleClass = "." + device; // 元素 类名
  console.log("dev res");
  for (let key in devices) {
    if (key == "light1") {
      setStateHelper(key, devices);
      // if (devices[key] == 1) $(".light1").text("开启");
      // else if(devices[key] == 0) $(".light1").text("关闭");
      // else $(".light1").text("未知");
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

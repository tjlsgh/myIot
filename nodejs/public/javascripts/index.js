var myChart;
const host = window.location.host;
let deviceId = window.location.pathname.split("/")[2] || "mydevice1";

window.onload = function () {
  myChart = echarts.init(document.getElementById("tempEchartBox"));
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
        let data = JSON.parse(msg.data);
        data.forEach((e) => {
          setOptions(e.time, e.value);
        });
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

var echartOption = {
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
function setOptions(time, value) {
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
  myChart.setOption(echartOption);
}

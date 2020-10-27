import * as echarts from '../../ec-canvas/echarts';
const app = getApp()
let temphumichart;
let devData = 0,
  devState = 1;
const reqCommand = {
  closeLed: "0",
  openLed: "1",
  checkDevState: "2",
};
let option = {
  title: {
    text: '实时数据',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['temp', 'humi']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  toolbox: {
    show: true,
    trigger: 'axis',
    // feature: {
    //   saveAsImage: {}
    // }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [{
      name: '温度',
      type: 'line',
      data: []
    },
    {
      name: '湿度',
      type: 'line',
      data: []
    },
  ]
};
// 初始化chart
function initChart(canvas, width, height, dpr) {
  let chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // 像素
  });
  canvas.setChart(chart);
  chart.setOption(option);
  temphumichart = chart;
  return chart;
}
// 画图
function drawLineChart(time, value) {
  option.xAxis.data.push(time);
  option.series[0].data.push(value.temp);
  option.series[1].data.push(value.humi);
  if (option.xAxis.data.length > 10) {
    option.xAxis.data.shift()
    option.series[0].data.shift()
    option.series[1].data.shift()
  }
  if (temphumichart) {
    temphumichart.setOption(option);
  }
}
// 初始化webSocket
function initWebSocket() {
  // 开启连接
  wx.connectSocket({
    url: app.globalData.webSocketUrl,
    header: {
      'content-type': 'application/json'
    },
    protocols: ['protocol1']
  });
  // 连接打开后发送设备id
  wx.onSocketOpen((result) => {
    console.log("--- websocket open !");
    let msg = JSON.stringify({
      deviceId: app.globalData.deviceId
    });
    wx.sendSocketMessage({
      data: msg
    })
  });
  // 收到数据应更新echart
  wx.onSocketMessage((result) => {
    //console.log(result.data);
    let data = JSON.parse(result.data);
    console.log(data);
    data.forEach(e => {
      if (e.value.type === devData) {
        drawLineChart(e.time, e.value);
      }
    })
    //drawLineChart()
  })
  // 连接错误
  wx.onSocketError((result) => {
    console.log("--- websocket error")
  });
  // 连接关闭
  wx.onSocketClose((result) => {
    console.log("--- websocket close")
  });
}
Page({
  onShareAppMessage: function (res) {
    return {
      title: 'WxProgram of MyIotSys',
      path: '/pages/index/index',
      success: function () {},
      fail: function () {}
    }
  },
  data: {
    ec: {
      onInit: initChart
    }
  },
  // 开灯
  led_open: function () {
    // $.post("/led/" + deviceId, { action: reqCommand.openLed });
    wx.request({
      url: app.globalData.httpUrl + "/led/" + app.globalData.deviceId,
      method: "POST",
      header: {
        "content-type": "application/json" 
      },
      data: {
        action: reqCommand.openLed,
        deviceId: app.globalData.deviceId
      },
      success: (data) => {
        console.log(data);
      }
    })
  },
  // 开灯
  led_close: function () {
    wx.request({
      url: app.globalData.httpUrl + "/led/" + app.globalData.deviceId,
      method: "POST",
      header: {
        "content-type": "application/json" 
      },
      data: {
        action: reqCommand.closeLed
      },
      success: (data) => {
        console.log(data);
      }
    })
  },
  changeDeviceId: function(value) {
    //console.log(value);
    app.globalData.deviceId = value.detail.value;
    // 设备id改变应再次发送id到websocket
    wx.sendSocketMessage({
      //data: app.globalData.deviceId
      data: JSON.stringify({
        deviceId: app.globalData.deviceId
      })
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {},
  // 页面一展示应初始化socket
  onShow: function () {
    console.log("--- onSHow invoke")
    initWebSocket();
  },
  // 页面隐藏关闭socket
  onHide: function () {
    try {
      wx.closeSocket({
        code: 1000,
      })
    } catch (error) {
      console.log("--- closeSocket error")
    }
  }
})
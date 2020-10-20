function echartInit(echart, eleId) {
  echart = echarts.init(document.getElementById(eleId));
  //   setOptions();
}

// 设置参数
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

// 图表绘制
function drawChart(data) {
  setOptions(data.time, data.value.temp, tempChart, tempChartOption);
  setOptions(data.time, data.value.humi, humiChart, humiChartOption);
}

module.exports = {
  echartInit: echartInit,
  drawChart: drawChart,
};

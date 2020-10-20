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

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

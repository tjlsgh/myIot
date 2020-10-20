var tempHistoryChart, humiHistoryChart;
window.onload = function () {
    tempHistoryChart = echarts.init(document.getElementById("tempHistoryChart"));
    humiHistoryChart = echarts.init(document.getElementById("humiHistoryChart"));
}
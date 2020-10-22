var express = require("express");
var router = express.Router();
let tcpServer = require("../bin/tcp_server.js");
let mongodb = require("../bin/mongodb.js");
const moment = require("moment");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "MyIotSys" });
});

router.get("/device/:id", (req, res, next) => {
  res.render("index", { title: "MyIotSys ——" + "设备名称: " + req.params.id });
});
// 根据设备id 获取历史数据
router.get("/history/:id", (req, res, next) => {
  console.log("jump to history")
  res.render("history", { title: "HISTORY" });
});
// 向设备发送命令
router.post("/led/:id", (req, res, next) => {
  console.log("post /led/:id ", req.params.id, req.body);
  tcpServer.sentCommand(req.params.id, req.body.action);
  res.send({ code: 0, msg: "command send" });
});
// 查看设备状态
router.post("/checkDevState/:id", (req, res, next) => {
  console.log("post /checkDevState/:id ", req.params.id, req.body);
  tcpServer.sentCommand(req.params.id, req.body.action);
  res.send({ code: 0, msg: "command send" });
});
module.exports = router;

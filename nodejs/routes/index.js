var express = require('express');
var router = express.Router();
let tcpServer = require('../bin/tcp_server.js');
let mongodb = require('../bin/mongodb.js');
const momet = require('moment');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'MyIotSys' });
});

router.get('/device/:id', (req, res, next) => {
  res.render('index', {title: 'MyIotSys ——' + '设备名称: ' + req.params.id});
})

router.get('/history/:id', (req, res, next) => {
  res.send('not really');
})

router.post('/led/:id', (req, res, next) => {
  console.log('post /led/:id ', req.params.id, req.body);
  tcpServer.sentCommand(req.params.id, req.body.action)
  res.send({code: 0, msg: 'command send'})
})
module.exports = router;

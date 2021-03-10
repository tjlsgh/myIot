# myIot----智慧宿舍

## 系统功能
* 系统能够实时监测当前的温湿度以及光照强度，并且能够通过esp8266将数据上传至云端的服务器，保存到数据库中。
* 用户可通过网页或者微信小程序查看实时的可视化的温湿度和光照强度，也可查看最近的二十条历史记录。同时，用户也可以向开发板发送命令来控制继电器进而控制窗帘开关和灯泡开关。
* 除此之外，当光照强度过高或者过低时，继电器会自动开或者关。继电器可与电机相连，这样就可以通过控制继电器的开关来控制窗帘。

## 硬件
* 开发板采用nodemcu
* 传感器有dht11温湿度传感器、光敏传感器
* 继电器是1路5V的

## 实物图
![image](https://user-images.githubusercontent.com/63591834/110636466-3fa2e280-81e7-11eb-82ce-043ccc79e03e.png)
![image](https://user-images.githubusercontent.com/63591834/110636819-afb16880-81e7-11eb-89ca-c0ee41e33378.png)
![image](https://user-images.githubusercontent.com/63591834/110636840-b3dd8600-81e7-11eb-8627-42192a441f97.png)

## 软件主界面
### 网页主界面
![image](https://user-images.githubusercontent.com/63591834/110638632-c1940b00-81e9-11eb-9561-5d6e4046f121.png)
![image](https://user-images.githubusercontent.com/63591834/110638648-c5c02880-81e9-11eb-8bf4-74208a4a7e3e.png)
### 桌面应用
![image](https://user-images.githubusercontent.com/63591834/110638610-b8a33980-81e9-11eb-846c-7569accfbd2e.png)
### 微信小程序
![image](https://user-images.githubusercontent.com/63591834/110638887-07e96a00-81ea-11eb-8d23-2910df9a6d8d.png)

## 技术栈
web 开发相关：HTML、CSS、JS
服务器开发相关：nodejs、linux，mongodb 基础
硬件开发相关：C 语言、嵌入式开发技能
桌面应用相关：electron基础
微信小程序相关：小程序开发基础



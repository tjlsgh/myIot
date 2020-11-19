#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <dht11.h>

#define DHT11_PIN 4                  // 温湿度引脚
#define RELAY_PIN 5                  // 继电器引脚
const char *host1 = "47.106.185.79"; // 远程连接
const char *host2 = "192.168.1.181"; // 本地连接1
const char *host3 = "192.168.43.104"; // 本地连接2
const int port = 8266;               // tcp 使用端口

const char *ssid = "pdc666"; // wifi名称
const char *password = "hhxxttxs2.0"; // wifi密码

const char *deviceId = "sensor001"; // 设备名称
int tick = 1000;
char data[70] = ""; // 发送数据
char res[70] = "";  // 发送回复
WiFiClient client; 
ESP8266WiFiMulti wifiMulti;
dht11 DHT11; // 温湿度
int ray;     // 光强
struct Dstate
{ // 设备状态 0：关闭 1：开启 2：未知
  const char *Id;
  int light1;   // 灯
  int relay1;   // 继电器
  int curtain1; // 窗帘
} dstate;
//struct Ddata { // 设备数据 （未用到）
//  int temp;
//  int humi;
//} dData;
void setup()
{
  Serial.begin(115200); // 波特率
  Serial.println();

  // 设置引脚为输出模式
  pinMode(LED_BUILTIN, OUTPUT); 
  pinMode(RELAY_PIN, OUTPUT);

  // 初始化状态
  digitalWrite(LED_BUILTIN, HIGH); // 关灯
  dstate.Id = deviceId;
  dstate.light1 = 0; // 0 表示关闭 1 表示开启 2 表示未知
  dstate.relay1 = 0;
  dstate.curtain1 = 0;

  // 连接wifi
//  WiFi.begin(ssid, password);
  wifiMulti.addAP("tlg", "tlg123glt");
  wifiMulti.addAP(ssid, password);
  Serial.print("Connecting");
  client.setTimeout(100);

//  while (WiFi.status() != WL_CONNECTED)
//  {
//    delay(500);
//    Serial.print(".");
//  }
  while(wifiMulti.run() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }
  Serial.println();

  Serial.print("Connected to ");
  Serial.println(WiFi.SSID());
  Serial.print("IP addres: ");
  Serial.println(WiFi.localIP());
}

void loop()
{
  if (client.connect(host1, port)) // 连接远程服务器
  {
    Serial.println("Connected to remote server!");
  } else if(client.connect(host2, port)) { // 连接本地
    Serial.println("Connected to local server!");  
  } else if(client.connect(host3, port)) {
    Serial.println("Connected to local server2!");
  }
  if (client.connected()) { // 连接成功发送id和状态并等待服务器返回id
    boolean sevReceiveId = false;
    while (!sevReceiveId)
    {
      if (client.available())
      {
        String line = client.readStringUntil('\n');
        if (line = ("OK"))
        {
          sevReceiveId = true;
          Serial.println("server received id ok");
          break;
        }
      }
      // 首次连接先发送设备 ID 和状态
      sprintf(res, "{\"type\": 1,\"Id\": \"%s\", \"devices\": {\"light1\": %d, \"relay1\": %d, \"curtain1\": %d}}", dstate.Id, dstate.light1, dstate.relay1, dstate.curtain1);
      //(res, "{\"devices\": {\"light1\": %d, \"relay1\": %d}}",dstate.light1, dstate.relay1);
      client.print(res);
      delay(1000);
    }
  }
  delay(500);
  Serial.print(".");
  // 连接成功
  while (client.connected()) {
    // 收到指令并执行
    if (client.available())
    {
      String line = client.readStringUntil('\n');
      if (line == "1") // 关灯指令
      {
        Serial.println("command:open led.");
        digitalWrite(LED_BUILTIN, LOW);
        dstate.light1 = 1;
        sprintf(res, "{\"type\": 1,\"devices\": {\"light1\": %d}}", dstate.light1); // type 0：设备回复 type 1：设备数据
        client.print(res);
      }
      else if (line == "0") // 开灯指令
      {
        Serial.println("command:close led.");
        digitalWrite(LED_BUILTIN, HIGH);
        dstate.light1 = 0;
        sprintf(res, "{\"type\":1,\"devices\":{\"light1\":%d}}", dstate.light1); // 关
        client.print(res);
      }
      else if (line == "3") // 拉窗帘指令
      {
        Serial.println("command:open curtain.");
        digitalWrite(RELAY_PIN, HIGH);
        dstate.curtain1 = 1;
        dstate.relay1 = 1;
        sprintf(res, "{\"type\": 1,\"devices\": {\"curtain1\": %d, \"relay1\": %d}}", dstate.curtain1, dstate.relay1); // type 0：设备回复 type 1：设备数据
        client.print(res);
      }
      else if (line == "4") // 关窗帘指令
      {
        Serial.println("command:close curtain.");
        digitalWrite(RELAY_PIN, LOW);
        dstate.curtain1 = 0;
        dstate.relay1 = 0;
        sprintf(res, "{\"type\":1,\"devices\":{\"curtain1\":%d, \"relay1\": %d}}", dstate.curtain1, dstate.relay1); // 关
        client.print(res);
      }
      else if (line == "2")
      {
        Serial.println("command:check device state.");
        sprintf(res, "{\"type\": 1,\"Id\": \"%s\", \"devices\": {\"light1\": %d, \"relay1\": %d, \"curtain1\": %d}}", dstate.Id, dstate.light1, dstate.relay1, dstate.curtain1);
        client.print(res);
      }
    }
    // 没有收到指令则发送数据
    else
    {
      // 发送数据
      int chk = DHT11.read(DHT11_PIN);
      ray = (100 - analogRead(A0) / 10.24);
      rayHandler(ray);
      // Serial.println(chk);
      if (chk != DHTLIB_ERROR_TIMEOUT)
      {
        sprintf(data, "{\"type\": 0, \"temp\": %d, \"humi\": %d, \"ray\": %d, \"light1\": %d}", DHT11.temperature, DHT11.humidity, ray, dstate.light1);
      }
      else
      {
        // 如果没读取到数据则发送随机数
        sprintf(data, "{\"type\": 0, \"temp\": %d, \"humi\": %d, \"ray\": %d, \"light1\": %d}", 20 + random(0 + 10), 50 + random(0 + 10), 40 + random(0 + 20), dstate.light1);
      }
      client.print(data);
      Serial.println(data);
      delay(tick);
    }
  }
}
void rayHandler(int ray){
  if(ray > 70 && dstate.curtain1 == 1) {
      digitalWrite(RELAY_PIN, LOW);
      dstate.curtain1 = 0;
      dstate.relay1 = 0;
      sprintf(res, "{\"type\":1,\"devices\":{\"curtain1\":%d, \"relay1\": %d}}", dstate.curtain1, dstate.relay1); 
      client.print(res);
  } else if( ray > 0 && ray < 20 && dstate.curtain1 == 0) {
      digitalWrite(RELAY_PIN, HIGH);
      dstate.curtain1 = 1;
      dstate.relay1 = 1;
      sprintf(res, "{\"type\": 1,\"devices\": {\"curtain1\": %d, \"relay1\": %d}}", dstate.curtain1, dstate.relay1);
      client.print(res);
  }
}

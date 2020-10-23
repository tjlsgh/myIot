#include <ESP8266WiFi.h>
#include <dht11.h>

#define DHT11_PIN 4

const char* host = "192.168.1.181";
const int port = 8266;// tcp 使用端口

const char* ssid = "pdc666";
const char* password = "hhxxttxs2.0";

const char* deviceId = "mydevice1";
int tick = 1000;
char data[50] = ""; // 发送数据
char res[50] = ""; // 发送状态
WiFiClient client;
dht11 DHT11;

struct Dstate { // 设备状态 0：关闭 1：开启 2：未知
  const char* Id;
  int light1;
  int relay1;
} dstate;
struct Ddata { // 设备数据 （未用到）
  int temp;
  int humi;
} dData;
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println();

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  // 初始化状态
  dstate.Id = deviceId;
  dstate.light1 = 0;
  dstate.relay1 = 2;
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting");
  client.setTimeout(100);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println(".");
  }
  Serial.println();

  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // put your main code here, to run repeatedly:
  if (client.connect(host, port)) {
    Serial.println("Connected!");
    // 首次连接先发送设备 ID 和状态
    sprintf(res, "{\"type\": 1,\"Id\": \"%s\", \"devices\": {\"light1\": %d, \"relay1\": %d}}",dstate.Id, dstate.light1, dstate.relay1);
    //(res, "{\"devices\": {\"light1\": %d, \"relay1\": %d}}",dstate.light1, dstate.relay1);
    client.print(res);
  } else {
    Serial.println("Connecting...");  
    delay(500);
  }

  while (client.connected()) {
    // 收到数据
    if (client.available()) {
      String line = client.readStringUntil('\n');
      if (line == "1") {
        Serial.println("command:open led.");
        digitalWrite(LED_BUILTIN, LOW);
        dstate.light1 = 1;
        sprintf(res, "{\"type\": 1,\"devices\": {\"light1\": %d}}", dstate.light1); // type 0：设备回复 type 1：设备数据
        client.print(res);
      }
      else if (line == "0") {
        Serial.println("command:close led.");
        digitalWrite(LED_BUILTIN, HIGH);
        dstate.light1 = 0;
        sprintf(res, "{\"type\":1,\"devices\":{\"light1\":%d}}", dstate.light1); // 关
        client.print(res);
      }else if (line == "2") {
        Serial.println("command:check device state.");
        sprintf(res, "{\"type\": 1,\"Id\": \"%s\", \"devices\": {\"light1\": %d, \"relay1\": %d}}",dstate.Id, dstate.light1, dstate.relay1);
        client.print(res);
      }
    } else { // 发送数据
      int chk = DHT11.read(DHT11_PIN);
      Serial.println(chk);
      // 如果没读取到数据则发送随机数
      if(chk != DHTLIB_ERROR_TIMEOUT) {
        sprintf(data, "{\"type\": 0, \"temp\": %d, \"humi\": %d, \"light1\": %d}", DHT11.temperature, DHT11.humidity, dstate.light1);
      } else {        
        sprintf(data, "{\"type\": 0, \"temp\": %d, \"humi\": %d,  \"light1\": %d}", 20 + random(0 + 10), 50 + random(0 + 10), dstate.light1);
      }
      client.print(data);
      Serial.println(data);
      delay(1000);
    }
  }
}

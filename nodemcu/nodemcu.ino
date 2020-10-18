#include <ESP8266WiFi.h>
#include <dht11.h>

#define DHT11_PIN 4

const char* host = "192.168.1.181";
const int port = 8266;// tcp 使用端口

const char* ssid = "pdc666";
const char* password = "hhxxttxs";

const char* deviceId = "mydevice1";
int tick = 1000;
char data[50] = "";
char res[50] = "";
WiFiClient client;
dht11 DHT11;
int lightState; // 灯泡状态

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println();

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  lightState = 0;
  
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
    //发送设备ID号
    client.print(deviceId);
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
        sprintf(res, "{\"type\":1,\"device\":{\"light1\": 1}}"); // 开
        client.print(res);
      }
      else if (line == "0") {
        Serial.println("command:close led.");
        digitalWrite(LED_BUILTIN, HIGH);
        sprintf(res, "{\"type\":1,\"device\":{\"light1\": 0}}"); // 关
        client.print(res);
      }
    } else { // 发送数据
      int chk = DHT11.read(DHT11_PIN);
      Serial.println(chk);
      // 如果没读取到数据则发送随机数
      if(chk != DHTLIB_ERROR_TIMEOUT) {
        sprintf(data, "{\"type\": 0, \"temp\": %d, \"humi\": %d, \"light1\": %d}", DHT11.temperature, DHT11.humidity, lightState);
      } else {        
        sprintf(data, "{\"type\": 0, \"temp\": %d, \"humi\": %d,  \"light1\": %d}", 20 + random(0 + 10), 50 + random(0 + 10), lightState);
      }
      client.print(data);
      Serial.println(data);
      delay(1000);
    }
  }




  
}

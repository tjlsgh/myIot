#include <ESP8266WiFi.h>
#include <dht11.h>

#define DHT11_PIN 4

const char* host = "192.168.1.181";
const int port = 8266;// tcp 使用端口

const char* ssid = "pdc666";
const char* password = "hhxxttxs";

const char* deviceId = "mydevice1";
int tick = 1000;

WiFiClient client;
dht11 DHT11;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println();

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
        client.print("OK");
      }
      else if (line == "0") {
        Serial.println("command:close led.");
        digitalWrite(LED_BUILTIN, HIGH);
        client.print("OK");
      }
    } else { // 发送数据
      int chk = DHT11.read(DHT11_PIN);
      client.print(DHT11.temperature);
      Serial.print("temp:");
      Serial.println(DHT11.temperature);
      delay(1000);
    }
  }




  
}

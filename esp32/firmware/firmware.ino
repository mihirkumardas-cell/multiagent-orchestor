/*
 * Sentrion — ESP32 Firmware
 * ─────────────────────────────────────────────────────────────────────────────
 * Hardware:
 *   - ESP32 DevKit (any variant)
 *   - HC-SR501 PIR Motion Sensor  → GPIO 14
 *   - Active Buzzer (optional)    → GPIO 27
 *   - Status LED (optional)       → GPIO 2 (onboard)
 *
 * Behaviour:
 *   1. Connect to WiFi on boot.
 *   2. Continuously poll PIR sensor.
 *   3. On motion → POST JSON { timestamp, sensor_id, location } to /event.
 *   4. Expose GET /trigger-alarm endpoint (called by backend alarm agent).
 *   5. Expose GET /silence-alarm endpoint.
 *   6. Blink LED and sound buzzer when alarm is active.
 *
 * Setup:
 *   - Install: Arduino IDE + ESP32 board package + ArduinoJson library
 *   - Set WiFi credentials + server IP below
 *   - Upload via USB (115200 baud)
 * ─────────────────────────────────────────────────────────────────────────────
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <time.h>

// ─── Configuration ────────────────────────────────────────────────────────────

const char* WIFI_SSID     = "Nothing 1";
const char* WIFI_PASSWORD = "12345678";

// FastAPI backend address
const char* BACKEND_HOST  = "http://172.18.112.72:8000";
const char* EVENT_ENDPOINT = "/event";

// GPIO pins
const int PIR_PIN    = 14;
const int BUZZER_PIN = 27;
const int LED_PIN    = 2;   // Onboard LED

// Sensor identity
const char* SENSOR_ID = "esp32_main";
const char* LOCATION  = "main_entrance";

// NTP (for accurate timestamps)
const char* NTP_SERVER  = "pool.ntp.org";
const long  GMT_OFFSET  = 19800;   // UTC+5:30 (IST) in seconds
const int   DST_OFFSET  = 0;

// Debounce: minimum ms between events
const unsigned long DEBOUNCE_MS = 5000;

// ─── State ───────────────────────────────────────────────────────────────────

bool alarmActive = false;
unsigned long lastEventMs = 0;

WebServer server(80);

// ─── Helpers ──────────────────────────────────────────────────────────────────

String getISO8601Timestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    // Fallback: uptime-based pseudo-timestamp
    return "1970-01-01T00:00:00+05:30";
  }
  char buf[35];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S+05:30", &timeinfo);
  return String(buf);
}

void beepBuzzer(int times, int onMs = 200, int offMs = 200) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(onMs);
    digitalWrite(BUZZER_PIN, LOW);
    if (i < times - 1) delay(offMs);
  }
}

void blinkLED(int times, int ms = 100) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(ms);
    digitalWrite(LED_PIN, LOW);
    if (i < times - 1) delay(ms);
  }
}

// ─── HTTP POST → /event ───────────────────────────────────────────────────────

void sendMotionEvent() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] WiFi not connected.");
    return;
  }

  String timestamp = getISO8601Timestamp();
  Serial.print("[EVENT] Motion detected at: ");
  Serial.println(timestamp);

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["timestamp"] = timestamp;
  doc["sensor_id"] = SENSOR_ID;
  doc["location"]  = LOCATION;
  String payload;
  serializeJson(doc, payload);

  // Send POST request
  HTTPClient http;
  String url = String(BACKEND_HOST) + EVENT_ENDPOINT;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int code = http.POST(payload);
  if (code > 0) {
    String response = http.getString();
    Serial.print("[HTTP] Response code: ");
    Serial.println(code);
    Serial.println(response);
  } else {
    Serial.print("[HTTP] Error: ");
    Serial.println(http.errorToString(code));
  }
  http.end();
}

// ─── WebServer Handlers (called by backend) ───────────────────────────────────

void handleTriggerAlarm() {
  alarmActive = true;
  Serial.println("[ALARM] Triggered by backend!");
  server.send(200, "application/json", "{\"alarm\":true,\"message\":\"Alarm activated\"}");
  beepBuzzer(3, 500, 100);
}

void handleSilenceAlarm() {
  alarmActive = false;
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("[ALARM] Silenced.");
  server.send(200, "application/json", "{\"alarm\":false,\"message\":\"Alarm silenced\"}");
}

void handleStatus() {
  StaticJsonDocument<128> doc;
  doc["alarm_active"] = alarmActive;
  doc["uptime_ms"]    = millis();
  doc["sensor_id"]    = SENSOR_ID;
  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handleNotFound() {
  server.send(404, "text/plain", "Not found");
}

// ─── Setup ───────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  Serial.println("\n[BOOT] Sentrion ESP32 Firmware v1.0");

  // GPIO init
  pinMode(PIR_PIN,    INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN,    OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN,    LOW);

  // WiFi
  Serial.print("[WiFi] Connecting to ");
  Serial.print(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 30) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected! IP: " + WiFi.localIP().toString());
    blinkLED(3, 200);
  } else {
    Serial.println("\n[WiFi] FAILED. Will retry...");
  }

  // NTP time sync
  configTime(GMT_OFFSET, DST_OFFSET, NTP_SERVER);
  Serial.println("[NTP] Syncing time...");
  delay(2000);

  // HTTP server routes
  server.on("/trigger-alarm", HTTP_POST, handleTriggerAlarm);
  server.on("/trigger-alarm", HTTP_GET,  handleTriggerAlarm);   // also accept GET for easy testing
  server.on("/silence-alarm", HTTP_POST, handleSilenceAlarm);
  server.on("/silence-alarm", HTTP_GET,  handleSilenceAlarm);
  server.on("/status",        HTTP_GET,  handleStatus);
  server.onNotFound(handleNotFound);
  server.begin();

  Serial.println("[HTTP] WebServer started on port 80");
  Serial.println("[READY] Sentrion is watching...");
  beepBuzzer(1, 100);
}

// ─── Loop ────────────────────────────────────────────────────────────────────

void loop() {
  server.handleClient();

  // ── Alarm blink ──────────────────────────────────────────────────────────
  if (alarmActive) {
    digitalWrite(LED_PIN,    HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(300);
    digitalWrite(LED_PIN,    LOW);
    digitalWrite(BUZZER_PIN, LOW);
    delay(300);
    return;  // skip motion check while alarm is screaming
  }

  // ── PIR motion check ─────────────────────────────────────────────────────
  int pirValue = digitalRead(PIR_PIN);
  unsigned long now = millis();

  if (pirValue == HIGH && (now - lastEventMs) > DEBOUNCE_MS) {
    lastEventMs = now;
    digitalWrite(LED_PIN, HIGH);
    sendMotionEvent();
    delay(200);
    digitalWrite(LED_PIN, LOW);
  }

  delay(100);
}

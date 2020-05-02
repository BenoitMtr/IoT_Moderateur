#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // by Benoit Blanchon
#include "net_misc.h" //Fonctions pour se connecter au WIFI

/* ---- CONSTANTES---- */
const int lumiPIN = A5;
const int tempPIN = 22;
const int redPIN = 18;
const int greenPIN = 23;
const String roomName = "Open Space";

String whoami; // Identification de CET ESP au sein de la flotte

WiFiClient espClient; // Wifi

void setup() {
  //------ Put your setup code here, to run once ------//

  //Initialisation des LEDs
  pinMode(redPIN, OUTPUT);
  pinMode(greenPIN, OUTPUT);
  
  // Serial
  Serial.begin(9600);
  while (!Serial); // wait for a serial connection. Needed for native USB port only
  /* Wifi */
  connect_wifi();
  /* Choix d'une identification pour cet ESP ---*/
  // whoami = "esp1"; 
  whoami =  String(WiFi.macAddress());
}

int getRoomVolumeLevel(){
  HTTPClient http;
  
  //Ne fonctionne pas pour les requêtes en localhost 
  http.begin("https://shrouded-eyrie-04230.herokuapp.com/getRoomVolumeLevel"); //Specify destination for HTTP request
  http.addHeader("Content-Type", "application/json"); //Specify content-type header
  int httpResponseCode = http.POST("{\"room\": \"" + roomName + "\"}"); //Send the actual POST request
  
  String response = "";
  int volumeLevel = -1;
  
  if(httpResponseCode > 0){ //Succès de l'envoi de la requête POST
    response = http.getString(); //Get the response to the request
    Serial.println("Success on sending POST : ");
  }
  else{
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
  }

 //Parse du JSON pour récupérer les infos
  const size_t capacity = JSON_OBJECT_SIZE(1) + 20;
  DynamicJsonDocument doc(capacity);
  deserializeJson(doc, response);
  volumeLevel = doc["volumeLevel"];
 
  http.end(); //Libération des ressources
  return volumeLevel;
}

void loop() {
  // put your main code here, to run repeatedly:
  int32_t period = 3000; // Publication period

  int volumeLevel = getRoomVolumeLevel();
  Serial.println(volumeLevel);
  if(volumeLevel > 20){
    digitalWrite(greenPIN, LOW);
    digitalWrite(redPIN, HIGH);
  }
  else{
    digitalWrite(greenPIN, HIGH);
    digitalWrite(redPIN, LOW);
  }
  
  delay(period); //Période en millisecondes
}

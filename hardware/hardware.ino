#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // by Benoit Blanchon
#include "net_misc.h" //Fonctions pour se connecter au WIFI

/* ---- CONSTANTES---- */
int32_t period = 2000; // Publication period
const int lumiPIN = A5;
const int tempPIN = 22;
const int redPIN = 13;
const int greenPIN = 12;
const int bluePIN = 14;
const String roomName = "Open Space"; //nom à changer selon la salle où on est

String whoami; // Identification de CET ESP au sein de la flotte

WiFiClient espClient; // Wifi

void setup() {
  //------ Put your setup code here, to run once ------//

  //Initialisation des LEDs
  pinMode(redPIN, OUTPUT);
  pinMode(greenPIN, OUTPUT);
  pinMode(bluePIN, OUTPUT);
  
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
    Serial.println(response);
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
  Serial.println("volume: ");
  Serial.print(volumeLevel);
  http.end(); //Libération des ressources
  return volumeLevel;
}

void loop() {
  // put your main code here, to run repeatedly:


  int volumeLevel = getRoomVolumeLevel();
  Serial.println(volumeLevel);
  if(volumeLevel > 30){
    digitalWrite(greenPIN, HIGH);
    digitalWrite(redPIN, LOW);
    digitalWrite(bluePIN, HIGH);
  }
  if(volumeLevel > 20 && volumeLevel <30)
  {
    digitalWrite(greenPIN, LOW);
    digitalWrite(redPIN, LOW);
    digitalWrite(bluePIN, HIGH);
  }
  if(volumeLevel > 10 && volumeLevel <20)
  {
    digitalWrite(greenPIN, LOW);
    digitalWrite(redPIN, HIGH);
    digitalWrite(bluePIN, HIGH);
  }
  if(volumeLevel >= -1 && volumeLevel <10)
  {
    digitalWrite(greenPIN, HIGH);
    digitalWrite(redPIN, HIGH);
    digitalWrite(bluePIN, LOW);
  }
  
  delay(period); //Période en millisecondes
}

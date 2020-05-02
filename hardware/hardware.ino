#include <WiFi.h>
#include <HTTPClient.h>
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
  // put your setup code here, to run once:
  // Serial
  Serial.begin(9600);
  while (!Serial); // wait for a serial connection. Needed for native USB port only
  /* Wifi */
  connect_wifi();
  /* Choix d'une identification pour cet ESP ---*/
  // whoami = "esp1"; 
  whoami =  String(WiFi.macAddress());
}

void post_test(){
    HTTPClient http;
    
    //Ne fonctionne pas pour les requêtes en localhost 
    http.begin("https://shrouded-eyrie-04230.herokuapp.com/getRoomVolumeLevel"); //Specify destination for HTTP request
    http.addHeader("Content-Type", "application/json"); //Specify content-type header
    int httpResponseCode = http.POST("{\"room\": \"" + roomName + "\"}"); //Send the actual POST request
 
   if(httpResponseCode>0){
 
    String response = http.getString(); //Get the response to the request
    Serial.println("Success on sending POST : ");
    Serial.println(httpResponseCode);   //Print return code
    Serial.println(response);           //Print request answer
 
   }else{
 
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
 
   }
 
   http.end();  //Free resources
}

void loop() {
  // put your main code here, to run repeatedly:
  int32_t period = 3000; // Publication period

  post_test();
  
  delay(period); //Période en millisecondes
}

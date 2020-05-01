/*** Basic Wifi connection ***/
#include <WiFi.h>

void print_ip_status(){
  Serial.print("\nWiFi connected !\n");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC address: ");
  Serial.println(WiFi.macAddress());
}

void connect_wifi(){
 // Access Point of the infrastructure
 const char* ssid = "OUI JE DIS LA WIFI ! - THIERRY";
 const char *password= "ThierryLeGenie"; 
 
 Serial.println("\nConnecting Wifi to ");
 Serial.println(ssid);
 
 Serial.print("Attempting to connect ");
 WiFi.begin(ssid, password);
 while(WiFi.status() != WL_CONNECTED){
   delay(1000);
   Serial.print(".");
 }
 
 print_ip_status();
}
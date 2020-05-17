
# IoT_Moderateur
Source: [http://www.i3s.unice.fr/~menez/M1Miage/TP4/tp4.pdf](http://www.i3s.unice.fr/~menez/M1Miage/TP4/tp4.pdf) (partie 3)

L'idée de ce projet, serait de créer un système permettant de mesurer le bruit ambiant dans un espace type openspace, là où il y a de multiples sources de bruit, et de pouvoir interagir avec celles devenant trop importantes afin de conserver un environnement de travail agréable pour tous.

# Equipe

- Julian ARNAUD, M1 MIAGE
- Benoît MONTORSI, M1 MIAGE
- Thierry TSANG, M1 MIAGE
# Matériel

- ESP32
- Bande lumineuse RGB (alimentée en 5 Volts), de préférence celle ci: [https://www.amazon.fr/D%C3%A9tecteur-Mouvement%EF%BC%8C-Multicolore-Interrupteur-Alimentation/dp/B06Y53TK4H](https://www.amazon.fr/D%C3%A9tecteur-Mouvement%EF%BC%8C-Multicolore-Interrupteur-Alimentation/dp/B06Y53TK4H)
- Micro compatible PC

# Détails techniques concernant l'installation

Durant le développement de notre système, nous avons défini que les LED du bandeau serait reliés à la carte de cette façon:

- LED Rouge: pin GPIO 13
- LED Verte: pin GPIO 12
- LED Bleue: pin GPIO 14

Le montage final doit ressembler à celui présent dans "montage bandeau led.jpg", en adaptant les pins des LED si besoin.

De plus,  la salle reliée à l'ESP est déterminée via la variable "roomName", pour changer la salle il faut modifier directement la variable dans le code. Cela fait partie de la phase d'installation.

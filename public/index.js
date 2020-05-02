let sumVolumeLevel = 0;
let numberOfRecords = 0;
//http://localhost:3000/
const URL = "https://shrouded-eyrie-04230.herokuapp.com/"; //Ne pas oublier le slash à la fin
let socket = io.connect(URL);
let rooms = [];
let dataTable;

//Ajout des rooms dans le select lors du chargement de la page
function updateSelect(){
  let selectRoom = document.getElementById("selectRoom");

  selectRoom.innerHTML = "";

  fetch(URL + "rooms")
  .then(response => response.json())
  .then(json => {
    for (var i = 0; i < json.length; i++) {
        let element = document.createElement("option");
        element.innerHTML = json[i]["name"];
        selectRoom.appendChild(element);
    }
  });
}


$( document ).ready(function() {
  let selectRoom = document.getElementById("selectRoom");

  updateSelect();

  //Ajout d'une pièce
  $("#addRoom").click(function(){
    if($("#roomNameToAdd").val() != ""){
      let selectedRoom = $("#selectRoom option:checked").val();

      socket.emit('addRoom', {
        room: $("#roomNameToAdd").val()
      });

      dataTable.ajax.reload();
      updateSelect();

      $("#roomNameToAdd").val("");
      $("#selectRoom").val(selectedRoom);
    }
  });

  //Tableau des salles
  dataTable = $('#dataTable').DataTable({
        "ajax": {
            "url": URL + "rooms",
            "dataSrc": ""
        },
        "columns": [
            { "data": "name" },
            { "data": "volumeLevel" }
        ],
        "order": [[ 1, "desc" ]],
        "language": {
          "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/French.json"
        }
    });

  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then(function(stream) {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  microphone = audioContext.createMediaStreamSource(stream);
  javascriptNode = audioContext.createScriptProcessor(2048, 1, 1); //audioCtx.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);

  analyser.smoothingTimeConstant = 0.8;
  analyser.fftSize = 1024;

  microphone.connect(analyser);
  analyser.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);
  javascriptNode.onaudioprocess = function() {
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      var values = 0;

      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += (array[i]);
      }

      var average = values / length;

    let volumeLevel = Math.round(average);
    console.log(volumeLevel);
    numberOfRecords += 1;
    sumVolumeLevel += volumeLevel;

    // colorPids(average);
  }
  })
  .catch(function(err) {
    /* handle the error */
  });

  function sendVolumeLevel(){
    //Pendant l'exécution de cette fonction, la page web continue d'enregistrer le microphone par conséquent on doit mettre à
    //jour les valeurs.
    let currentSumVolumeLevel = sumVolumeLevel;
    let currentNumberOfRecords = numberOfRecords;

    let meanVolumeLevel = Math.round(sumVolumeLevel/numberOfRecords);

    sumVolumeLevel -= currentSumVolumeLevel;
    numberOfRecords -= currentNumberOfRecords;
    let selectedRoom = selectRoom.value;
    socket.emit('volumeLevel', {
      room: selectedRoom,
      volumeLevel: meanVolumeLevel
    });

    document.getElementById("volumeLevel").innerHTML = meanVolumeLevel;
  }

  setInterval(sendVolumeLevel, 3000); //Envoi du volume au serveur à intervalle régulier
  setInterval( function () {
      dataTable.ajax.reload();
  }, 10000 );
});

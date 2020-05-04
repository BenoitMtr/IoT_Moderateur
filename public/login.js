const URL = "https://shrouded-eyrie-04230.herokuapp.com/";
let socket = io.connect(URL);

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

$( document ).ready(function(){
  $("#login-button").click(function(){
    socket.emit('login', {
      email: $("#login-email").val(),
      password: $("#login-password").val()
    });
  });

  $("#signup-button").click(function(){
    socket.emit('signup', {
      email: $("#signup-email").val(),
      password: $("#signup-password").val(),
      isAdmin: $("#signup-admin").val()
    });
  });

  $("#closeAlert").click(function(){
    $('#alertLogin').removeClass('show');
  });
});

socket.on("homepage", (data) => {
  setCookie("email", data.email , 30);
  setCookie("isAdmin", data.isAdmin , 30);
  window.location.replace(URL);
});

socket.on("connectError", function(){
  $("#alertLogin").addClass("show");
});

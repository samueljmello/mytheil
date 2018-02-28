var rich = "#rich";
var lefteye = $("#left-eye");
var righteye = $("#right-eye");
var eyes = $("#left-eye, #right-eye");
var music = $("#music")[0];
var wanderTimeout;
var wanderInterval;

$(document).keydown(function (e) {
  switch (e.which) {
    case 32: animateOn("open"); break;
    case 37: animateOn("tilt-left"); break;
    case 39: animateOn("tilt-right"); break;
    case 38: animateOn("up"); break;
    case 40: animateOn("down"); break;
    case 88: animateOn("apocalypse", "body"); break;
  }
  resetEyes();
  waitToWander();
});


$(document).keyup(function (e) {
  switch (e.which) {
    case 32: animateOff("open"); break;
    case 37: animateOff("tilt-left"); break;
    case 39: animateOff("tilt-right"); break;
    case 38: animateOff("up"); break;
    case 40: animateOff("down"); break;
    case 88: animateOff("apocalypse", "body"); break;
  }
});

function startWandering() {
  resetEyes();
  wanderInterval = setInterval(function() {
    var randX = getRandomInt(0, $(window).width());
    var randY = getRandomInt(0, $(window).height());
    moveEyes(randX, randY);
  }, 4000);
}

function resetEyes() {
  $(lefteye).attr("style",null);
  $(righteye).attr("style",null);
  $(eyes).addClass("wander");
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function waitToWander() {
  clearInterval(wanderInterval);
  clearTimeout(wanderTimeout);
  $(eyes).removeClass("wander");
  wanderTimeout = setTimeout(function() {
    startWandering();
  }, 7000);
}

function animateOn(cssClass, thisObject) {
  $(getObject(thisObject)).addClass(cssClass);
}
function animateOff(cssClass, thisObject) {
  $(getObject(thisObject)).removeClass(cssClass);
}
function getObject(thisObject) {
  if (thisObject === undefined) {
    thisObject = rich;
  }
  return thisObject;
}


$('#container').imagesLoaded( function() {
  checkAudio();
});

$(".toggle-audio").click(function() {
  if (music.paused) {
    music.play();
    $(".toggle-audio").removeClass("fa-volume-off").addClass("fa-volume-up").attr("title","Pause Music");
  }
  else {
    music.pause();
    $(".toggle-audio").removeClass("fa-volume-up").addClass("fa-volume-off").attr("title","Play Music");
  }
});

var audioCheckInterval;
function checkAudio() { 
  audioCheckInterval = setInterval(function() {
    if (music.readyState >= 4) {
      music.volume = 0.25;
      music.play();
      $("#loading").remove();
      clearInterval(audioCheckInterval);
    }
  }, 250);
};

var animationTimeout;
$(".play-richism").click(function() {
  var clip = $("#richism-" + $(this).attr("data-src"))[0];
  $(".play-richism").each(function() {
    var stopThis = $("#richism-" + $(this).attr("data-src"));
    stopThis[0].currentTime = 0;
    stopThis[0].pause();
  });
  $("#top").addClass($(this).attr("data-src"));
  animationTimeout = setTimeout(function() {
    $("#top").removeAttr("class");
  }, $(this).attr("data-length"));
  clip.play();
});

var segments = 8;
var segmentX = ($(window).width() / segments);
var segmentY = ($(window).height() / segments);

var postype = "px";
var lefteyeposX = $(lefteye).css("right").replace(postype,"");
var lefteyeposY = $(lefteye).css("top").replace(postype,"");
var righteyeposX = $(righteye).css("left").replace(postype,"");
var righteyeposY = $(righteye).css("top").replace(postype,"");

var currentpositionX = -3;
var currentpositionY = -3;

function locatePosition(pos,segmentpos) {
  for (var i = 1; i <= segments; i++) {
    if (pos < (segmentpos * i) || i == segments) {
      var halfway = segments / 2;
      if (segments % 2 === 0 && i <= halfway) {
        halfway += 1;
      }
      return parseInt(i - halfway);
    }
  }
}

function moveEyes(x,y) {
  var newpositionX = locatePosition(x, segmentX);
  var newpositionY = locatePosition(y, segmentY);
  var poschange = false;
  if (currentpositionX != newpositionX) {
    poschange = true;
    currentpositionX = newpositionX;
  }
  if (currentpositionY != newpositionY) {
    poschange = true;
    currentpositionY = newpositionY;
  }
  if (poschange) {
    var movefactor = 2.5;
    var newpositionleftXstyle = parseInt(lefteyeposX) - parseInt(currentpositionX * (movefactor * 1.5));
    var newpositionleftYstyle = parseInt(lefteyeposY) + parseInt(currentpositionY * movefactor);
    var newpositionrightXstyle = parseInt(righteyeposX) + parseInt(currentpositionX * (movefactor * 1.5));
    var newpositionrightYstyle = parseInt(righteyeposY) + parseInt(currentpositionY * movefactor);
    $(lefteye).attr("style","right:" + newpositionleftXstyle + postype + ";top:" + newpositionleftYstyle + postype + ";");
    $(righteye).attr("style","left:" + newpositionrightXstyle + postype + ";top:" + newpositionrightYstyle + postype + ";");
  }
}

$(document).mousemove(function(e) {
  waitToWander();
  moveEyes(e.pageX,e.pageY);
});

$(window).resize(function() {
  segmentX = ($(window).width() / segments);
  segmentY = ($(window).height() / segments);
  resetEyes();
  lefteyeposX = $(lefteye).css("right").replace(postype,"");
  lefteyeposY = $(lefteye).css("top").replace(postype,"");
  righteyeposX = $(righteye).css("left").replace(postype,"");
  righteyeposY = $(righteye).css("top").replace(postype,"");
});

waitToWander();

// create globally scoped variables
var rich = "#rich";
var lefteye = $("#left-eye");
var righteye = $("#right-eye");
var eyes = $("#left-eye, #right-eye");
var music = $("#music")[0];
var bottom = $("#bottom");
var wanderTimeout;
var wanderInterval;
var debug = false;
var segments = 8;
var segmentX;
var segmentY;
var postype = "px";
var lefteyeposX;
var lefteyeposY;
var righteyeposX;
var righteyeposY;
var currentpositionX = -3;
var currentpositionY = -3;

// functions
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
  $(bottom).addClass($(this).attr("data-src"));
  animationTimeout = setTimeout(function() {
    $(bottom).removeAttr("class");
  }, $(this).attr("data-length"));
  clip.play();
});

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
  var oldpositionX = currentpositionX;
  var oldpositionY = currentpositionY;
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

    if (debug === true) {
      console.log("changing position from: " + oldpositionX + " x " + oldpositionY + " to " + currentpositionX + " x " + currentpositionY);
      console.log("left eye x calculations: " + parseInt(lefteyeposX) + " - (" + currentpositionX + " * (" + movefactor + " * 1.5)) = " + newpositionleftXstyle);
      console.log("left eye y calculations: " + parseInt(lefteyeposY) + " - (" + currentpositionY + " * " + movefactor + ") = " + newpositionleftYstyle);
      console.log("right eye x calculations: " + parseInt(righteyeposX) + " - (" + currentpositionX + " * (" + movefactor + " * 1.5)) = " + newpositionrightXstyle);
      console.log("right eye y calculations: " + parseInt(righteyeposY) + " - (" + currentpositionY + " * " + movefactor + ") = " + newpositionrightYstyle);
    }
  }
}

function setWindowSize() {
  segmentX = ($(window).width() / segments);
  segmentY = ($(window).height() / segments);
}

function setEyePosition() {
  $(lefteye).attr("style",null);
  $(righteye).attr("style",null);
  lefteyeposX = $(lefteye).css("right").replace(postype,"");
  lefteyeposY = $(lefteye).css("top").replace(postype,"");
  righteyeposX = $(righteye).css("left").replace(postype,"");
  righteyeposY = $(righteye).css("top").replace(postype,"");
  if (debug === true) {
    console.log("left: " + lefteyeposX + " x " + lefteyeposY + "right: " + righteyeposX + " x " + righteyeposY);
  }
}

// wait for all images to load
$('body').imagesLoaded( function() {

  // functions to call after all image downloads

  // call first
  checkAudio();

  // safe to call non-async since images have all downloaded
  setWindowSize();
  setEyePosition();
  waitToWander();

  // create binds

  // on mouse move, adjust eyes
  $(document).mousemove(function(e) {
    waitToWander();
    moveEyes(e.pageX,e.pageY);
  });

  // on window resize, adjust
  $(window).resize(function() {
    setWindowSize();
    setEyePosition();
  });

  // key press down
  $(document).keydown(function (e) {
    switch (e.which) {
      case 32: animateOn("open"); break; // space
      case 37: animateOn("tilt-left"); break; // left
      case 39: animateOn("tilt-right"); break; // right
      case 38: animateOn("up"); break; // up
      case 40: animateOn("down"); break; // down
      case 87: animateOn("up", "#shoulders"); break; // w
      case 83: animateOn("down", "#shoulders"); break; // s
      case 65: animateOn("tilt-left", "#shoulders"); break;  // a
      case 68: animateOn("tilt-right", "#shoulders"); break;  // d
      case 88: animateOn("apocalypse", "body"); break; // x
      case 69: animateOn("wink"); break; // e
    }
    resetEyes();
    waitToWander();
  });

  // keys coming up after press
  $(document).keyup(function (e) {
    switch (e.which) {
      case 32: animateOff("open"); break; // space
      case 37: animateOff("tilt-left"); break; // left
      case 39: animateOff("tilt-right"); break; // right
      case 38: animateOff("up"); break; // up
      case 40: animateOff("down"); break; // down
      case 87: animateOff("up", "#shoulders"); break; // w
      case 83: animateOff("down", "#shoulders"); break; // s
      case 65: animateOff("tilt-left", "#shoulders"); break;  // a
      case 68: animateOff("tilt-right", "#shoulders"); break;  // d
      case 88: animateOff("apocalypse", "body"); break; // x
      case 69: animateOff("wink"); break; // e
    }
  });
});
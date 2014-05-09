
// Copyright 2011 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var canvas;
var context;
var images = {};
var totalResources = 9;
var numResourcesLoaded = 0;
var fps = 30;
var charX = 38; //position
var charY = 140;
var jumpHeight = 70;
var breathInc = 0.1;
var breathDir = 1;
var breathAmt = 0;
var breathMax = 2;
var breathInterval = setInterval(updateBreath, 1000 / fps);
var maxEyeHeight = 14;
var curEyeHeight = maxEyeHeight;
var eyeOpenTime = 0;
var timeBtwBlinks = 4000;
var blinkUpdateTime = 200;                    
var blinkTimer = setInterval(updateBlink, blinkUpdateTime);
var fpsInterval = setInterval(updateFPS, 1000);
var numFramesDrawn = 0;
var curFPS = 0;
var jumping = false;
var currentMap;


function updateFPS() {
	curFPS = numFramesDrawn;
	numFramesDrawn = 0;
}
function prepareCanvas(canvasDiv, canvasWidth, canvasHeight) {
    // Adjust jQuery animation interval to ease CPU usage (jQuery default is 13 ms)
    jQuery.fx.interval = 25;
	// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d"); // Grab the 2d canvas context
	// Note: The above code is a workaround for IE 8and lower. Otherwise we could have used:
	//     context = document.getElementById('canvas').getContext("2d");
	canvas.width = canvas.width; // clears the canvas 
	context.fillText("loading...", 40, 140);
	loadImage("leftArm");
	loadImage("legs");
	loadImage("torso");
	loadImage("rightArm");
	loadImage("head");
	loadImage("hair");		
	loadImage("leftArm-jump");
	loadImage("legs-jump");
	loadImage("rightArm-jump");
    showMap('library_first');
}

function loadImage(name) {
  images[name] = new Image();
  images[name].onload = function() { 
	  resourceLoaded();
  }
  images[name].src = "images/" + name + ".png";
}

function resourceLoaded() {
  numResourcesLoaded += 1;
  if(numResourcesLoaded === totalResources) {
	setInterval(redraw, 1000 / fps);
  }
}

function redraw() {
  var x = charX;
  var y = charY;
  canvas.width = canvas.width; // clears the canvas
  // Draw shadow
  if (jumping) {
	drawEllipse(x + 40, y + 29, 100 - breathAmt, 4);
  } else {
	drawEllipse(x + 40, y + 29, 160 - breathAmt, 6);
  }
  if (jumping) {
	//y -= jumpHeight;
  }
  if (jumping) {
	context.drawImage(images["leftArm-jump"], x + 40, y - 42 - breathAmt);
  } else {
	context.drawImage(images["leftArm"], x + 40, y - 42 - breathAmt);
  }
  if (jumping) {
	context.drawImage(images["legs-jump"], x, y- 6);
  } else {
	context.drawImage(images["legs"], x, y);
  }
  context.drawImage(images["torso"], x, y - 50);
  context.drawImage(images["head"], x - 10, y - 125 - breathAmt);
  context.drawImage(images["hair"], x - 37, y - 138 - breathAmt);
  if (jumping) {
	context.drawImage(images["rightArm-jump"], x - 35, y - 42 - breathAmt);
  } else {
	context.drawImage(images["rightArm"], x - 15, y - 42 - breathAmt);
  }
  drawEllipse(x + 47, y - 68 - breathAmt, 8, curEyeHeight); // Left Eye
  drawEllipse(x + 58, y - 68 - breathAmt, 8, curEyeHeight); // Right Eye
}

function drawEllipse(centerX, centerY, width, height) {
  context.beginPath();
  context.moveTo(centerX, centerY - height/2);
  context.bezierCurveTo(
	centerX + width/2, centerY - height/2,
	centerX + width/2, centerY + height/2,
	centerX, centerY + height/2);
  context.bezierCurveTo(
	centerX - width/2, centerY + height/2,
	centerX - width/2, centerY - height/2,
	centerX, centerY - height/2);
  context.fillStyle = "black";
  context.fill();
  context.closePath();	
}

function updateBreath() {
  if (breathDir === 1) {  // breath in
	breathAmt -= breathInc;
	if (breathAmt < -breathMax) {
	  breathDir = -1;
	}
  } else {  // breath out
	breathAmt += breathInc;
	if(breathAmt > breathMax) {
	  breathDir = 1;
	}
  }
}

function updateBlink() {
    eyeOpenTime += blinkUpdateTime;
    if(eyeOpenTime >= timeBtwBlinks){
        eyeBlink();
    }
}

function eyeBlink() {
    curEyeHeight -= 1;
    if (curEyeHeight <= 0) {
	    eyeOpenTime = 0;
	    curEyeHeight = maxEyeHeight;
    } else {
	    setTimeout(eyeBlink, 10);
    }
}

function jump() {
  if (!jumping) {
	jumping = true;
      var oldTop = parseInt($("#canvas").css("top"));
      $("#canvas").css("top", oldTop - jumpHeight);
	setTimeout(land, 500);
  }

}
function land() {
  jumping = false;
    var oldTop = parseInt($("#canvas").css("top"));
    $("#canvas").css("top", oldTop + jumpHeight);

}


var keys = [];

$("html").keydown(function(event){
    if (keys.length > 2) return;
    keys.push (event.which);
    moveHero();
    getBook();
    getRope();
    getNet();
    jumpOverObstacle();

});


var movingRight = false;
var movingLeft = false;
var distance = 120;

function moveHero () {
    var moveTo = keys[0];
    if(moveTo == "37") {
        // Left
        if (movingLeft == false) {
            movingRight = false;
            movingLeft = true;
            var canvas_left = parseInt($('#canvas').css('left'));
            if (canvas_left > 0) {
                var distance = 180;
                if (canvas_left < distance) {
                    distance = canvas_left;
                }
                $('#canvas').stop(true).animate(
                    { left:  "-=" + distance + "px" },
                    { easing: "linear",
                        complete: function() { movingLeft = false; }
                    }
                );
            }
        }
    }

    if(moveTo == "39") {
        // Right

        if (movingRight == false) {
            movingLeft = false;
            movingRight = true;
            canvas_left = parseInt($('#canvas').css('left'));
            if (canvas_left < 600) {
                $('#canvas').stop(true).animate(
                    { left:  "+=180" },
                    { easing: "linear",
                        complete: function() { movingRight = false; }
                    }
                );
            }
        }
    }

    if(moveTo == "38") {
        // Up
        jump();
        //$("#canvas").stop(true).animate({"top" : "-=30px"});
    }

    if(moveTo == "40") {
        // Down
        //$("#canvas").stop(true).animate({"top" : "+=30px"});
    }

    keys = keys.slice (1);
};


function getBook(){
    var canvas_left = parseInt($('#canvas').css('left'));
    if (canvas_left > 480)
    {
        if (currentMap === 'secret_room') {
            if(jumping == true){
                $('#animal').css('visibility', 'hidden');
                setTimeout(function () {
                    $('embed').remove();
                    $('body').append('<embed src="music/GerriClick.wav" autostart="true" hidden="true" loop="false">');
                    showMap('piha');
                    hideMap('secret_room');
                }, 1500);
            }
        }
    }
}

function getRope(){
        var canvas_left = parseInt($('#canvas').css('left'));
        if (canvas_left > 10 && canvas_left < 400)
        {
            if (currentMap === 'piha'){
                if(jumping == true)
                {
                    $('#rope').css('visibility', 'hidden');
                    $('embed').remove();
                    $('body').append('<embed src="music/GerriClick.wav" autostart="false" hidden="true" loop="false">');
                    $('#inventory-rope').css('visibility', 'visible');
                    //$('#inventory_hand_net').css('visibility', 'visible');
                    //$('#hand_net').css('visibility', 'hidden');

                }
            }
        }
}

function getNet(){
    var canvas_left = parseInt($('#canvas').css('left'));
    if (currentMap === 'piha') {
        if (canvas_left > 300 && canvas_left < 450){
            if(jumping == true)
            {
                $('#hand_net').css('visibility', 'hidden');
                $('embed').remove();
                $('body').append('<embed src="music/GerriClick.wav" autostart="false" hidden="true" loop="false">');
                $('#inventory_hand_net').css('visibility', 'visible');

            }
        }
    }
}

function showMap(mapName) {
    currentMap = mapName;
    $('#map').css('background-image', 'url(assets/' + mapName + '.png)');
    switch (mapName) {
        case 'library_first':
            $('#dark').css('visibility', 'visible');
            break;
        case 'secret_room':
            $('#animal').css('visibility', 'visible');
            $('#speech_start').css('visibility', 'visible');
            break;
        case 'piha':
            $('.fence').css('visibility', 'visible');
            $('#rope').css('visibility', 'visible');
            $('.grass').css('visibility', 'visible');
            $('#speech_bubble').css('visibility', 'visible');
            $('#hand_net').css('visibility', 'visible');
            $('#lawnmower').css('visibility', 'visible');
            updateAnimalSource();
            // Position player
            $('#canvas').css('left', '70px');
            break;
        case 'forest':
            $('#home').css('visibility', 'visible');
            $('#rock').css('visibility', 'visible');
            $('#flowerpot').css('visibility', 'visible');
            $('#speech_bubble4').css('visibility', 'visible');
            // Position player
            $('#canvas').css('left','0px');
            break;
        case 'cave':
            $('#cat').css('visibility', 'visible');
            $('#tail').css('visibility', 'visible');
            $('#bush').css('visibility', 'visible');
            // Position player
            $('#canvas').css('left','0px');
            showCatTail();
            break;
    }
}

function hideMap(mapName) {
    switch (mapName) {
        case 'library_first':
            $('#dark').css('visibility', 'hidden');
            break;
        case 'secret_room':
            $('#speech_start').css('visibility', 'hidden');
            $("#animal").css('visibility', 'hidden');
            break;
        case 'piha':
            $('.fence').css('visibility', 'hidden');
            $('#rope').css('visibility', 'hidden');
            $('.grass').css('visibility', 'hidden');
            $('#speech_bubble').css('visibility', 'hidden');
            $('#speech_bubble2').css('visibility', 'hidden');
            $('#hand_net').css('visibility', 'hidden');
            $('#lawnmower').css('visibility', 'hidden');
            $('#fly').css('visibility', 'hidden');
            flyAnimate = false;
            $('#speech_bubble3').css('visibility', 'hidden');
            break;
        case 'forest':
            $('#home').css('visibility', 'hidden');
            $('#rock').css('visibility', 'hidden');
            $('#butterfly').css('visibility', 'hidden');
            $('#flowerpot').css('visibility', 'hidden');
            $('#speech_bubble4').css('visibility', 'hidden');
            $('#speech_bubble5').css('visibility', 'hidden');
            break;
        case 'cave':
            $('#cat').css('visibility', 'hidden');
            $('#bush').css('visibility', 'hidden');
            hideCatTail();
            break;
    }
}

function debug_changeMap(mapName) {
    hideMap('library_first');
    hideMap('secret_room');
    hideMap('piha');
    hideMap('forest');
    hideMap('cave');
    showMap(mapName);
}

function jumpOverObstacle(){
    /*var canvas_left = parseInt($('#canvas').css('left'));
    if(canvas_left > 170){
        if(currentMap === 'forest'){
            if(jumping == true)
            {
                $('#canvas').css('top', '127px');
            }
        }

    }*/
}

//click on the dark wall to enter secret room
$('#dark').on('click', function()
{
    showMap('secret_room');
    hideMap('library_first');
})

setInterval(blink, 2000);
function blink() {
    $("#rope").fadeTo(1000, 0.5).fadeTo(1000, 1.0);
    $("#hand_net").fadeTo(1000, 0.5).fadeTo(1000, 1.0);
    $("#dark").fadeTo(1000, 0.5).fadeTo(1000, 1.0);
}



$('#rope').on('click', function(){
    $('#rope').css('visibility', 'hidden');
    $('embed').remove();
    $('body').append('<embed src="music/GerriClick.wav" autostart="true" hidden="true" loop="false">');
    $('#inventory-rope').css('visibility', 'visible');

 });

$('#hand_net').on('click', function(){
    $('#hand_net').css('visibility', 'hidden');
    $('embed').remove();
    $('body').append('<embed src="music/GerriClick.wav" autostart="true" hidden="true" loop="false">');
    $('#inventory_hand_net').css('visibility', 'visible');
});

$('#speech_bubble').on('click', function(){
    $('#speech_bubble').css('visibility', 'hidden');
});

$('#speech_bubble2').on('click', function(){
    $('#speech_bubble2').css('visibility', 'hidden');
});

$('#speech_bubble3').on('click', function(){
    $('#speech_bubble3').css('visibility', 'hidden');
});

$('#speech_bubble4').on('click', function(){
    $('#speech_bubble4').css('visibility', 'hidden');
});

$('#speech_start').on('click', function(){
    $('#speech_start').css('visibility', 'hidden');
});

function animatethis(targetElement) {
    $(targetElement).animate({ left: "+=15px"},
        {
            duration: 500,
            complete: function ()
            {
                targetElement.animate({ left: "-=100px" },
                    {
                        duration: 1000/*,
                        complete: function ()
                        {
                            animatethis(targetElement, speed);
                        }*/
                    });
            }
        });
};

function animatePot(targetElement) {
    $(targetElement).animate({ left: "+=20px"},
        {
            duration: 500,
            complete: function ()
            {
                targetElement.animate({ left: "-=90px" },
                    {
                        duration: 1000/*,
                     complete: function ()
                     {
                     animatethis(targetElement, speed);
                     }*/
                    });
            }
        });
};

var lawnmowerClicked = false;
$('#lawnmower').on('click', function (){
    if (lawnmowerClicked == false) {
        lawnmowerClicked = true;
        $('embed').remove();
        $('body').append('<embed src="music/GerriLawnmower.wav" autostart="false" hidden="true" loop="false">');
        $('.grass').fadeOut(10000);
        $('#speech_bubble2').css('visibility', 'hidden');
        animatethis($('#lawnmower')),
            setTimeout(function () {
                flyStart();
                $('embed').remove();
                $('body').append('<embed src="music/GerriFly.wav" autostart="false" hidden="true" loop="true">');
                $('#zero_score').css('visibility', 'hidden');
                $('#score15').css('visibility', 'hidden');
                $('#score5').css('visibility', 'visible');

                $('#speech_bubble3').css('visibility', 'visible');


            }, 1500);


    }
});

var flowerpotClicked = false;
$('#flowerpot').on('click', function (){
    if (flowerpotClicked == false) {
        flowerpotClicked = true;
        $('embed').remove();
        $('body').append('<embed src="music/flowerpot.wav" autostart="true" hidden="true" loop="true">');
        $('#speech_bubble2').css('visibility', 'hidden');
        animatePot($('#flowerpot')),
            setTimeout(function () {
                butterflyStart();
                $('embed').remove();
                $('body').append('<embed src="music/butterfly.wav" autostart="true" hidden="true" loop="true">');
                $('#zero_score').css('visibility', 'hidden');
                $('#score5').css('visibility', 'hidden');
                $('#score').css('visibility', 'hidden');
                $('#score15').css('visibility', 'visible');
            }, 1500);


    }
});

var ropeClicked = false;
var netClicked = false;

$('#rope').on('click', function() {
    ropeClicked = true;
});

$('#hand_net').on('click', function() {
    netClicked = true;
});

$('#rope, #hand_net').on('click', function() {
    if (ropeClicked && netClicked) {
        $('#speech_bubble2').css('visibility', 'visible');
        $('#speech_bubble').css('visibility', 'hidden');
    }
});

/***************************************************************
 * Fly related things
 **************************************************************/
var flyAnimate = false;
function flyStart() {
    // Move fly to the starting point
    $("#fly").css('left', '750px');
    $("#fly").css('top', '420px');
    // Make the fly visible
    $('#fly').css('visibility', 'visible');
    // Allow fly animation
    flyAnimate = true;
    // Show the first animation where fly flies from the starting point (the lawnmower) to
    // the normal flying position (closer to the top of the screen)
    // and then call the next animation step - flyLeft.
    $("#fly").animate({left: "-=200", top: "-=320"}, 1000, "swing", flyLeft);
}
function flyLeft() {
    if (flyAnimate) {
        $("#fly").animate({left: "-=500"}, 2000, "swing", flyRight);
    }
}
function flyRight() {
    if (flyAnimate) {
        $("#fly").animate({left: "+=500"}, 2000, "swing", flyLeft);
    }
}
$('#fly').on('click', function(){
    $('#fly').css('visibility', 'hidden');
    flyAnimate = false;

    // TODO: what is this code below and does it belong here?
    $('#speech_bubble3').css('visibility', 'hidden');
    $('embed').remove();
    $('body').append('<embed src="music/GerriClick.wav" autostart="true" hidden="true" loop="false">');
    setTimeout(function(){
        $('#zero_score').css('visibility', 'hidden');
        $('#score').css('visibility', 'visible');
        $('#score5').css('visibility', 'hidden');
    }, 500);
    setTimeout(function(){
        showMap('forest');
        hideMap('piha');
    }, 2000);

});

/***************************************************************
 * Butterfly related things
 **************************************************************/
var time = 0;
function butterflyStart() {
    $('#butterfly').css('visibility', 'visible');
    animateButterfly();
}
function animateButterfly() {
    time += 0.01;

    var r = 300;
    var xcenter = 400;
    var ycenter = 200;
    var newLeft = Math.floor(xcenter + (r * Math.cos(time)));
    var newTop = Math.floor(ycenter + (r * Math.sin(time)));
    $('#butterfly').animate({
        top: newTop,
        left: newLeft
    }, 1, function() {
        animateButterfly();
    });
}

$('#butterfly').on('click', function(){
    $('#butterfly').css('visibility', 'hidden');
    $('#speech_bubble5').css('visibility', 'hidden');
    $('embed').remove();
    $('body').append('<embed src="music/GerriClick.wav" autostart="true" hidden="true" loop="false">');
    setTimeout(function(){
        $('#zero_score').css('visibility', 'hidden');
        $('#score').css('visibility', 'hidden');
        $('#score5').css('visibility', 'hidden');
        $('#score15').css('visibility', 'visible');

    }, 500);
    setTimeout(function(){
        showMap('cave');
        hideMap('forest');
    }, 2000);
    setTimeout(function(){
        $('#catSpeech1').css('visibility', 'visible');
    }, 6000);

});


var catTailVisible = false;
function hideCatTail() {
    catTailVisible = false;
    $('#tail').css('visibility', 'hidden');
    $('#tail2').css('visibility', 'hidden');
    $('#tail3').css('visibility', 'hidden');
}
function showCatTail() {
    catTailVisible = true;
    flapTail();
}
function flapTail() {
    if (catTailVisible === false) {return;}
    setTimeout(function () {
        if (catTailVisible === false) {return;}
        $('#tail2').css('visibility', 'visible');
        $('#tail').css('visibility', 'hidden');
        setTimeout(function () {
            if (catTailVisible === false) {return;}
            $('#tail3').css('visibility', 'visible');
            $('#tail2').css('visibility', 'hidden');
            setTimeout(function () {
                if (catTailVisible === false) {return;}
                $('#tail2').css('visibility', 'visible');
                $('#tail3').css('visibility', 'hidden');
                setTimeout(function() {
                    if (catTailVisible === false) {return;}
                    $('#tail').css('visibility', 'visible');
                    $('#tail2').css('visibility', 'hidden');
                    flapTail();
                }, 500);
            }, 500);
        }, 500);
    }, 500);
}





function updateAnimalSource(){
    /*var audio = document.getElementById('audio');
    audio.src='music/humor.mp3';

    //audio.src='music/animal.mp3';
    audio.autoplay=true;
    audio.load();*/
}
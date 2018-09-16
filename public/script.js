try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}

var giphy = $('#giphy').hide();
var giflink = $('#giflink').hide();
var gotcha = $('#gotcha').hide();
var instructions = $('#recording-instructions');
var giri = $('#giri');
var begin = true;

var noteContent = '';
var url = "http://api.giphy.com/v1/gifs/search?q="
var key = "&api_key=4PPrw34uk2F8zbvfDmFa2gxMcxaBk5k8&limit=5"
var request = new XMLHttpRequest();

request.onload = function () {
  // Begin accessing JSON data here
  var res = JSON.parse(this.response);
  console.log(res.data[0])
  if (request.status >= 200 && request.status < 400) {
    giphy.attr('src',res.data[0]['embed_url']).show();
    giflink.attr('href', res.data[0]['url']).show()
    gotcha.show();
  } else {
    console.log('error');
  }
}
  
recognition.start();
/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;

// This block is called every time the Speech APi captures a line. 
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  noteContent += transcript;
  console.log(noteContent);
  if (begin) {
    if (noteContent.match(/[*ry]/g)) {
      giri.text("giri says hello")
      instructions.text("Ask giri a question!");
      noteContent = '';
      begin = false;
    } else {
      instructions.text("Didn't quite get that wanna try to wake giri again? lol (say \"hey giri\"");
    }
  } else {
    console.log(noteContent);
    var query = noteContent.replace(/[\s]/g, "+");
    request.open('GET', url + query + key, false);
    request.send();
  }
};

recognition.onspeechend = function() {
  if (!begin) {
    instructions.text('giri is not listening blah blah blah :(');
  }
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('Giri no hear much. Try again.'); 
    recognition.start(); 
  };
}

/*-----------------------------
      App buttons and input 
------------------------------*/

$('#askgiri').on('click', function(e) {
  noteContent = '';
  giflink = $('#giflink').hide();
  giphy = $('#giphy').hide();
  gotcha = $('#gotcha').hide();
  instructions.text('Say hey giri!');
  recognition.start();
});

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
var giripic = $('#giripic')
var begin = true;
var girititle = $('#girititle');

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
    giflink.attr('href', res.data[0]['url']).show();
    girititle.text("Giri, like Siri (but not better ): )")
    instructions.text("don't ask giri a question :(")
    giripic.hide();
    gotcha.show();
  } else {
    console.log('error');
  }
}
  
/*-----------------------------
      Voice Recognition 
------------------------------*/ 
recognition.continuous = true;
recognition.onresult = function(event) {
  var current = event.resultIndex;

  var transcript = event.results[current][0].transcript;
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  noteContent += transcript;
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

recognition.onend = function() {
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

recognition.start();


/*-----------------------------
      App buttons and input 
------------------------------*/

$('#askgiri').on('click', function(e) {
  noteContent = '';
  giphy.hide();
  giflink.hide();
  gotcha.hide();
  girititle.text("Giri, like Siri (but not better ): )")
  instructions.text('Say hey giri!');
  recognition.start();
});
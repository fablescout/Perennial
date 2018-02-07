var p = 0;
var s = 0;
var audio = [];
var vidArray = [];
var audLengths  =[];
var permLengths  =[];
var minAudio = [];
var minPerm = [];
var vidname;
var audname;
var x = document.getElementById('submitted').innerHTML;

/*
document.getElementById('buttonID').style.display is called in many functions to update the display.
*/

document.getElementById('audio').style.display = 'block';
document.getElementById('addAud').style.display = 'block'; 
document.getElementById('submit').style.display = 'none';
document.getElementById('play').style.display = 'none';
document.getElementById('play2').style.display = 'none';
document.getElementById('save').style.display = 'none';

var app = require('electron').remote; 
var dialog = app.dialog;

var smalltalk = require('smalltalk');
const storage = require('electron-json-storage');

loadMenu();

function clearThis(target){
target.value = null;
}

/*
makeArray() adds audio tracks to the audio array and updates user prompts and buttons
*/

function makeArray() {
	if(!document.getElementById("audio").value)
		document.getElementById('errors').innerHTML = "No audio selected";
	else{
		for(i=0;i<document.getElementById("audio").files.length;i++){
			var nameString = document.getElementById("audio").files[i].path;
			audio.push(nameString);
			console.log(nameString);
		}
		s += document.getElementById("audio").files.length;
		clearThis(document.getElementById("audio"));
		document.getElementById('errors').innerHTML = " ";
		if(s < 2){
			document.getElementById('errors').innerHTML = "Add at least one more audio track";
			document.getElementById('submitted').innerHTML = x + " | " + s + " audio track added";
		} else{
			document.getElementById('submitted').innerHTML = x + " | " + s + " audio tracks added";
			document.getElementById('submit').style.display = 'block';
		} 
	}
}

/*
makeOBJ() makes a scene object consisting of the selected video and multiple audio tracks assigned to it.
The number of audio tracks and permutations are stored in audLengths and permLengths. 
The smallest values are pulled each call and stored in minAudio and minPerm.
This is to ensure the final movie doesn't run out of tracks. 
If one scene has 3 tracks and the others have 5, permutations of sets of 3 will be used.
*/


function makeObj() {
	if(!document.getElementById("video").value)
		document.getElementById('errors').innerHTML = "No video selected";
	else{
		a = 0;
		s = 0;
		var nameString = document.getElementById("video").files[0].path;
 		var video = new vid(nameString,audio);
 		audLengths.push(audio.length);
 		minAudio = Math.min.apply(null,audLengths);
		//console.log(minAudio);
 		permLengths.push(video.audio.length);
 		minPerm = Math.min.apply(null,permLengths);
		//console.log(minPerm);
  		vidArray.push(video);
  		//console.log(video);
  		//console.log(vidArray);
  		audio = [];
  		clearThis(document.getElementById("video"));
  		clearThis(document.getElementById("audio"));
  		p++;
  		if(p < 2){
  			document.getElementById('submitted').innerHTML = p + " scene created";
  			document.getElementById('errors').innerHTML = "Add at least one more scene";
  		}else{
  			document.getElementById('submitted').innerHTML = p + " scenes created";  
 			document.getElementById('play').style.display = 'block';
  			document.getElementById('save').style.display = 'block';
  		}
  		x = document.getElementById('submitted').innerHTML;
  		document.getElementById('audio').style.display = 'block';
  		document.getElementById('addAud').style.display = 'block'; 
		document.getElementById('submit').style.display = 'none';
  		document.getElementById('errors').innerHTML = " ";
	}
}

var anonymous = null;

var i = 1;
var j = 0;
var z = 0;

var index = 0; //getRandomIntInclusive(0, vidArray.length - 1)

function playOnClick(){
	i = 1;
	playArray(index,document.getElementById("myVid"),document.getElementById("myAud"),vidArray);
	//document.getElementById('audio').style.display = 'block';
	//document.getElementById('play').style.display = 'none';
	//document.getElementById('submit').style.display = 'none';
	document.getElementById('controls').style.display = 'none';
	document.getElementById('myVid').style.display = 'block';
}

/*
playArray() is where the magic happens. Check out your console to see the iteration through the array.
*/

function playArray(index,ele,ele2,array,listener){
	if (anonymous != null)
		ele.removeEventListener("ended", anonymous);
	console.log(i + ' '+ index +' '+ j +' '+ z);
	ele.src = array[index].video;
	ele.load();
	ele.play();
	ele2.src = array[index].audio[j][z];
	//console.log(array[index].audio);
	ele.onplay = function() {
		ele2.play();
	};
	ele2.play();
	if(i%(array.length*minAudio)==0)
		j++;
	if(j>=minPerm)
		j = 0;
	if(i%(array.length)==0)
		z++;
	if(z>=minAudio)
		z = 0;
		index++;
	if(index>=array.length){
        	index=0;
	}
	i++;
	listener = ele.addEventListener('ended',function(){
        	anonymous=arguments.callee; playArray(index,ele,ele2,array,listener);
		},false);
}

function vid(vid,aud) {
	this.video = vid;
	this.audio = shuffle(permute(aud));
}

function save() {
	if(vidArray[0]==null)
		document.getElementById('errors').innerHTML = "Nothing to save";
	else{
		smalltalk.prompt('', 'Save As:', '').then(function(value) {
			storage.set(value, vidArray);
			console.log(value);
			var array = storage.get(value);
			console.log(array);
			loadMenu();
		}, function() {
    			console.log('cancel');
		});
	}
}

function getFileExtension3(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function loadMenu(){
	storage.keys(function(error, keys) {
		if (error) throw error;
		var sel = document.getElementById('loadList');
		for (var key of keys) {
			console.log(key)
			if(getFileExtension3(key) == "json"){
				key = key.replace(/\..+$/, '');
				var opt = document.createElement('option');
				opt.innerHTML = key;
				opt.value = key;
				sel.appendChild(opt);
  			}
  		}
	});
}

function load() {
	var value = document.getElementById("loadList").value;
	storage.get(value, function(error, data) {
	if (error) throw error;
	for(i=0; i < data.length; i++){
		vidArray.push(data[i]);
		audLengths.push(data[i].audio[0].length);
		permLengths.push(data[i].audio.length);
	}
	minAudio = Math.min.apply(null,audLengths);
	minPerm = Math.min.apply(null,permLengths);
	console.log(vidArray);
	console.log(vidArray.length);
	console.log(audLengths);
	console.log(permLengths);
	console.log(minAudio);
	console.log(minPerm);
	document.getElementById('submitted').innerHTML = "Project " + "\"" + value + "\"" + " Loaded";  
	document.getElementById('play2').style.display = 'block';
	document.getElementById('play').style.display = 'none';
	document.getElementById('video').style.display = 'none';
	document.getElementById('audio').style.display = 'none';
	document.getElementById('addAud').style.display = 'none';
	document.getElementById('save').style.display = 'none'; 
	document.getElementById('submit').style.display = 'none';
	document.getElementById('title1').style.display = 'none';
	document.getElementById('title2').style.display = 'none';
	});
}




function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

  	return array;
}

function permute(permutation) {
	var length = permutation.length,
	result = new Array([0, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600][length]),
	c = new Array(length).fill(0),
	i = 1,
	j = 1;
	result[0] = permutation.slice();
	while (i < length) {
		if (c[i] < i) {
			var k = (i % 2) ? c[i] : 0,
			p = permutation[i];
			permutation[i] = permutation[k];
			permutation[k] = p;
			++c[i];
			i = 1;
			result[j] = permutation.slice();
			++j;
		} else {
			c[i] = 0;
			++i;
		}
	}
	return result;
}

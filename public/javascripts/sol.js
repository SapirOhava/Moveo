// written by sapir ohava , 24/10/2021

const playButton = document.querySelector('#play');
const recordButton = document.querySelector('#record');
const container = document.querySelector('#container');
const pads = document.querySelector('#pads');
let TracksToAddToCycle = [];
let recordAudio = new Audio();
recordAudio.crossOrigin = "anonymous";
recordAudio.type = "audio/mpeg";
recordAudio.src = "";
let playRecordingButton = document.createElement("button");

const files = ["https://9pads-songs.s3.us-east-2.amazonaws.com/1.mp3",
    "https://9pads-songs.s3.us-east-2.amazonaws.com/2.mp3",
    "https://9pads-songs.s3.us-east-2.amazonaws.com/3.mp3",
    "https://9pads-songs.s3.us-east-2.amazonaws.com/4.mp3",
    "https://9pads-songs.s3.us-east-2.amazonaws.com/5.mp3",
    "https://9pads-songs.s3.us-east-2.amazonaws.com/6.mp3",
    "https://9pads-songs.s3.us-east-2.amazonaws.com/7.mp3",
    "https://9pads-songs.s3.us-east-2.amazonaws.com/8.mp3",
    "https://9pads-songs.s3.us-east-2.amazonaws.com/9.mp3"
];

//initializes all audios 
const audios = files.map(file => {
    let audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.type = "audio/mpeg";
    audio.src = file;
    return audio;
});
//create AudioContext (audio wen api)
var ctx = new AudioContext();
const merger = ctx.createChannelMerger(audios.length);
merger.connect(ctx.destination);

//creates all source nodes and gain nodes and connect them to the merger
const gains = audios.map(audio => {
    var gain = ctx.createGain();
    var source = ctx.createMediaElementSource(audio);
    source.connect(gain);
    gain.connect(merger);
    return gain;
});

//setting all the pads volumes to 0 ( mute) at the start of the execution
for (let i = 0; i < gains.length; i++) {
    gains[i].gain.value = 0;
}
//isSomeGainIsOn is true if at least one pad is on ( unmuted)
let isSomeGainIsOn = 'false';

// buffers values sais if all audio are downloaded and ready to be played
let buffered = 'false';
//load = the number of files are not loaded yet
let load = files.length;

//when an audio is loaded update the load var , when all audios are loaded 
//buffered is true
audios.forEach(audio => {
    audio.addEventListener("canplaythrough", () => {

        load--;
        if (load === 0) {
            buffered = 'true';
        }
    });
})

//return the delay of all audios
// const getDelay = function() {
//     var times = [];
//     for (var i = 0; i < audios.length; i++) {
//         times.push(audios[i].currentTime);
//     }

//     var minTime = Math.min.apply(Math, times);
//     var maxTime = Math.max.apply(Math, times);
//     return maxTime - minTime;
// }

// //set the same time to all audios
// const setTime = function(time) {
//     audios.forEach(audio => audio.currentTime = time);
// }

// setInterval(() => {
//     if (getDelay() >= 0.05) {
//         setTime(audios[0].currentTime);
//     }
// }, 5000);

//when the play button is clicked
playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    // play or pause track depending on state
    //play
    if (this.dataset.playing === 'false') {

        isSomeGainIsOn = 'false';
        for (let i = 0; i < gains.length; i++) {
            if (gains[i].gain.value === 1) {
                isSomeGainIsOn = 'true';
            }
        }
        //if every gain is with 0 vol , then we turn on the audio pad immediatly
        if (isSomeGainIsOn === 'false') {
            for (let i = 0; i < TracksToAddToCycle.length; i++) {
                gains[TracksToAddToCycle[i]].gain.value = 1;
            }

            if (TracksToAddToCycle.length > 0) {
                audios.forEach(audio => audio.play());
                //removes all pads from the array, because weve already unmuted their gain nodes
                TracksToAddToCycle = [];
                this.dataset.playing = 'true';
            }

        }
        //if at least one gain is with vol 1 , the pad is on the next cycle
        if (isSomeGainIsOn === 'true') {
            audios.forEach(audio => audio.play());
            this.dataset.playing = 'true';
        }


    } //pause
    else if (this.dataset.playing === 'true') {

        audios.forEach(audio => audio.pause());
        for (let i = 0; i < gains.length; i++) {
            gains[i].gain.value = 0;
        }
        this.dataset.playing = 'false';
    }

}, false);




//when the cycle end , and a new cycle is starting
audios[0].addEventListener('ended', () => {

    for (let i = 0; i < TracksToAddToCycle.length; i++) {
        gains[TracksToAddToCycle[i]].gain.value = 1;
    }

    const doStuff = function() {
        if (buffered !== 'true') { //we want it to match to true
            setTimeout(doStuff, 50); //wait 50 millisecnds then recheck
            return;
        }
    }
    doStuff();
    if (buffered === 'true') {
        audios.forEach(audio => audio.play());
    }

    //removes all pads from the array, because weve already unmuted their gain nodes
    TracksToAddToCycle = [];
}, false);

// adds a number of the pad to the TracksToAddToCycle array
const addTrackToCycle = function(numOfTrack) {
    TracksToAddToCycle.push([parseInt(numOfTrack, 10)]);
}

// when a pad is clicked
pads.addEventListener('click', function(e) {
    if (e.target.attributes.state.value === 'false') {
        const trackNumber = e.target.attributes.id.value;
        addTrackToCycle(trackNumber);
        e.target.attributes.state.value = 'true';
    } else {
        const trackNumber = e.target.attributes.id.value;
        gains[parseInt(trackNumber, 10)].gain.value = 0;
        e.target.attributes.state.value = 'false';
    }
})

let audioBlob = "";
let audioUrl = "";
let mediaRecorder = new MediaRecorder(new MediaStream());
let audioChunks = [];

//when the record Button is clicked
recordButton.addEventListener('click', function(e) {


    if (this.dataset.state === 'off') {

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                })
                mediaRecorder.addEventListener("stop", () => {
                    audioBlob = new Blob(audioChunks);
                    audioUrl = URL.createObjectURL(audioBlob);
                    recordAudio.src = audioUrl;

                });

            });
        this.dataset.state = 'on';
    } else {
        mediaRecorder.stop();
        playRecordingButton.innerHTML = "play recording"; // Insert text
        container.appendChild(playRecordingButton);
        this.dataset.state = 'off';
    }

})

//when the play record button is clicked 
playRecordingButton.addEventListener('click', function(e) {
    console.log('recordAudio');
    console.dir(recordAudio);
    recordAudio.play();
})
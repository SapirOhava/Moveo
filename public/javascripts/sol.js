const playButton = document.querySelector('button');
const container = document.querySelector('#pads');
let TracksToAddToCycle = [];

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

const audios = files.map(file => {
    let audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.type = "audio/mpeg";
    audio.src = file;
    return audio;
});
var ctx = new AudioContext();
const merger = ctx.createChannelMerger(audios.length);
merger.connect(ctx.destination);

const gains = audios.map(audio => {
    var gain = ctx.createGain();
    var source = ctx.createMediaElementSource(audio);
    source.connect(gain);
    gain.connect(merger);
    return gain;
});
for (let i = 0; i < gains.length; i++) {
    gains[i].gain.value = 0;
}
//all gains values are o
let isSomeGainIsOn = 'false';

// buffers values sais if all audio are downloaded and ready to be played
let buffered = 'false';
// num of files are not loaded yet
let load = files.length;
audios.forEach(audio => {
    audio.addEventListener("canplaythrough", () => {
        console.log(audio.attributes.src.value);
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


playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    // play or pause track depending on state
    //play
    if (this.dataset.playing === 'false') {
        console.log(`playbutton pressed, TracksToAddToCycle=${TracksToAddToCycle}`);
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
    console.log(`ended, TracksToAddToCycle=${TracksToAddToCycle}`);
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
container.addEventListener('click', function(e) {
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
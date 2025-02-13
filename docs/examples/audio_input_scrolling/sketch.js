let csound = null;
var audioSample = new Array(1000);
let amplitude;
let audioOn, audioOff, audioState=true;
let audioImagePos;
let isPlaying = false;

/* RW 2022 */

async function preload() {

    audioOn = loadImage("../audio_on.png");
    audioOff = loadImage("../audio_off.png");

    csound = await Csound.create({ options: ['-odac', '-iadc', '--0dbfs=1'] });

    await csound.evalCode(`
    instr 1
        setksmps 1
        a1 inch 1
        chnset k(a1), "amp"
    endin
    `);

    await csound.start();

    //query the amplitude every 50ms..
    setInterval(async function () {
        amplitude = await csound.getControlChannel("amp");
    }, 10);

}

//create canvas
function setup() {
    var cnv = createCanvas(800, 200);
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    cnv.position(x, y);
    background("#212121");
    audioImagePos = {x:width-50, y:height-50, w:32, h:32};
}

function draw() {
    background("#374752");
    if (csound && isPlaying) {
        // add new level to end of array
        audioSample.push(amplitude);

        // remove first item in array
        audioSample.splice(0, 1);

        // loop through all the previous levels
        for (var i = 0; i < audioSample.length; i++) {
            //maps x index according to number of samples in array
            //saves us from having to calculate the x-spacing
            var x = map(i, audioSample.length, 0, 0, width);
            //get a height level for each sample
            var h = map(audioSample[i], 0, 0.5, 1, height);

            strokeWeight(0)
            fill("#46B5CB");
            rect(width - x, height / 2, 1, h);
        }
    } else {
        textAlign(CENTER);
        fill(255);
        text("Press the screen to start", width / 2, height / 2);
    }

    image(audioState ? audioOn : audioOff, audioImagePos.x, audioImagePos.y, audioImagePos.w, audioImagePos.h);
}

async function mousePressed() {
    Csound.startAudio()

    if (!isPlaying)
        await csound.evalCode("schedule(1, 0, 9999)");

    isPlaying = true;

    if (mouseX > audioImagePos.x && mouseY > audioImagePos.y &&
        mouseX < audioImagePos.x + audioImagePos.w && mouseY < audioImagePos.y + audioImagePos.h) {
        if (audioState) {
            await csound.pause();
            audioState = false;
        }
        else {
            await csound.resume();
            print("resuming");
            audioState = true;
        }
    }
}

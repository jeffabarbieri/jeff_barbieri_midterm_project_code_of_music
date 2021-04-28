//midi values of root notes
const C2 = 36;
const CSHARP2 = 37;
const D2 = 38;
const DSHARP2 = 39;
const E2 = 40;
const F2 = 41;
const FSHARP2 = 42;
const G2 = 43;
const GSHARP2 = 44;
const A2 = 45;
const ASHARP2 = 46;
const B2 = 47;

const C3 = 48;
const CSHARP3 = 49;
const D3 = 50;
const DSHARP3 = 51;
const E3 = 52;
const F3 = 53;
const FSHARP3 = 54;
const G3 = 55;
const GSHARP3 = 56;
const A3 = 57;
const ASHARP3 = 58;
const B3 = 59;

const C4 = 60;
const CSHARP4 = 61;
const D4 = 62;
const DSHARP4 = 63;
const E4 = 64;
const F4 = 65;
const FSHARP4 = 66;
const G4 = 67;
const GSHARP4 = 68;
const A4 = 69;
const ASHARP4 = 70;
const B4 = 71;

const C5 = 72;
const CSHARP5 = 73;
const D5 = 74;
const DSHARP5 = 75;
const E5 = 76;
const F5 = 77;
const FSHARP5 = 78;
const G5 = 79;
const GSHARP5 = 80;
const A5 = 81;
const ASHARP5 = 82;
const B5 = 83;

let root = 0;
let drawPlaybar = false;

let major = [0, 2, 4, 5, 7, 9, 11];
let minor = [0, 2, 3, 5, 7, 9, 10];
let playKey = major;

Tone.Transport.bpm.value = 60;
Tone.Transport.scheduleRepeat(onBeat, "4n");
let beat = 0;

//define synth for playback
let synth = new Tone.Synth();
synth.oscillator.type = 'sawtooth'; //'fatsawtooth';
synth.toDestination();

let delay = new Tone.PingPongDelay(
  {
    delayTime : "8n",
    wet : 0.2
  }
);

let delayActive = false;

//constant dimensions of interface
const canvasWidth = 750;
const canvasHeight = 500;

//store objects in 2d array
let grid = [];
grid[0] = [];

//store which interval is playing at each beat
let tones = [];

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
  addStepButton = createButton('add step');
  addStepButton.id = 0;
  addStepButton.position(0, canvasHeight * 1.025);
  addStepButton.mousePressed(updateStepsBeats);
  
  removeStepButton = createButton('remove step');
  removeStepButton.id = 1;
  removeStepButton.position(0, canvasHeight * 1.1);
  removeStepButton.mousePressed(updateStepsBeats);
  
  addBeatButton = createButton('add beat');
  addBeatButton.id = 2;
  addBeatButton.position(0 + canvasWidth * 0.15, canvasHeight * 1.025);
  addBeatButton.mousePressed(updateStepsBeats);
  
  removeBeatButton = createButton('remove beat');
  removeBeatButton.id = 3;
  removeBeatButton.position(0 + canvasWidth * 0.15, canvasHeight * 1.1);
  removeBeatButton.mousePressed(updateStepsBeats);
  
  randomizeSequenceButton = createButton('RANDOMIZE SEQUENCE');
  randomizeSequenceButton.id = 4;
  randomizeSequenceButton.position(0 + canvasWidth * 0.3, canvasHeight * 1.025);
  randomizeSequenceButton.mousePressed(updateStepsBeats);
  
  randomizeGridButton = createButton('RANDOMIZE GRID');
  randomizeGridButton.id = 5;
  randomizeGridButton.position(0 + canvasWidth * 0.3, canvasHeight * 1.1);
  randomizeGridButton.mousePressed(updateStepsBeats);
  
  midiButton = createButton('output midi');
  midiButton.id = 6;
  midiButton.position(0 + canvasWidth * 0.75, canvasHeight * 1.025);
  midiButton.mousePressed(updateStepsBeats);
  
  bpmSlider = createSlider(20, 500, 60, 1);
  bpmSlider.position(0 + canvasWidth * 0.75, canvasHeight * 1.1);
  bpmSlider.input(updateTempo);
  
  delayButton = createButton('toggle delay');
  delayButton.id = 78
  delayButton.position(0 + canvasWidth * 0.58, canvasHeight * 1.025);
  delayButton.mousePressed(updateStepsBeats);
  
  keyButton = createButton('major/minor');
  keyButton.id = 8;
  keyButton.position(0 + canvasWidth * 0.58, canvasHeight * 1.1);
  keyButton.mousePressed(updateStepsBeats);
}

function draw() {
  background(0);
  
  fill(255);
  textFont('Georgia');
  textSize(36);
  text('add steps and beats to begin', canvasWidth/5, canvasHeight/2);
  
  for (let i = 0; i < grid.length; i++) {
     for (let j = 0; j < grid[i].length; j++) {
        fill(grid[i][j].shade);
        rect(xPos(i, j), yPos(i, j), getWidth(), getHeight());
    }
  } 
  
    if (drawPlaybar)
    {
      playbarColor = color(0, 0, 255);
      playbarColor.setAlpha(127);
      fill(playbarColor);
      rect(xPos(0, (beat - 1) % grid[0].length), 0, getWidth(), canvasHeight);
      //console.log("beat: " + beat % grid[0].length);
    }
  
}

function updateStepsBeats()
{
  if (this.id == 0) addStep();
  
  else if (this.id == 1 && grid.length > 1) removeStep();
  
  else if (this.id == 2) addBeat();
  
  else if (this.id == 3 && grid[0].length > 1) removeBeat();
  
  else if (this.id == 4) randomizeSequence();
  
  else if (this.id == 5) randomizeGrid();
  
  else if (this.id == 6) printMidi();
  
  else if (this.id == 7) toggleDelay();
  
  else if (this.id == 8) toggleKey();
  
  //console.log('beats: ' + grid[0].length + ' steps: ' + grid.length);
  
  //printGrid();
  updateArray();
}

function randomizeSequence()
{

  for (let j = 0; j < grid[0].length; j++) {
    let index = randomInt(grid.length) - 1;
    for (let x = 0; x < grid.length; x++) {
            grid[x][j].isActive = false;
            grid[x][j].shade = 255; 
    }
    grid[index][j].isActive = true;
    grid[index][j].shade = 100;
  }
  updateArray();
  console.log('sequence randomized');
}

function randomizeGrid()
{
  //clear grid
  grid = [];
  grid[0] = [];
  
  beats = randomInt(16);
  steps = randomInt(16);
  
  for (let i = 0; i < beats; i++)
    {
      addBeat();
    }
  
  for (let j = 0; j < steps; j++)
      {
          addStep();
      }
  updateArray();
  console.log('grid randomized');
}

function randomInt(max) 
{
  return 1 + Math.floor(Math.random() * max);
}

function updateTempo()
{
  console.log('bpm: ' + this.value());
  Tone.Transport.bpm.value = this.value();
}

function mousePressed()
{
  if(mouseX <= canvasWidth && mouseY <= canvasHeight) {
    let i = floor(mouseY / (canvasHeight/grid.length));
    let j = floor(mouseX / (canvasWidth/grid[0].length));
    
    //if a note that is turned on is clicked, turn it off
    if (grid[i][j].isActive)
    {
      grid[i][j].isActive = false;
    }
    
    else {
      //otherwise, clear all notes in that column and set the note
      for (let x = 0; x < grid.length; x++) {
          grid[x][j].isActive = false;
          grid[x][j].shade = 255; 
      }
      
      grid[i][j].isActive = true;
    }
    
    if (grid[i][j].isActive) grid[i][j].shade = 100;
    else grid[i][j].shade = 255;  
  }
  updateArray();
  //printGrid();
}

function keyPressed() {
  //each row of keys on keyboard represents one octave, from c3 (top) to c6 (bottom)
  //console.log(keyCode);
  Tone.start();
  beat = 0;
  if (keyCode === 49) playRoot(C2);
  
  else if (keyCode === 50) playRoot(CSHARP2);
  
  else if (keyCode === 51) playRoot(D2);
  
  else if (keyCode === 52) playRoot(DSHARP2);
  
  else if (keyCode === 53) playRoot(E2);
  
  else if (keyCode === 54) playRoot(F2);
  
  else if (keyCode === 55) playRoot(FSHARP2);
  
  else if (keyCode === 56) playRoot(G2);
  
  else if (keyCode === 57) playRoot(GSHARP2);
  
  else if (keyCode === 48) playRoot(A2);
  
  else if (keyCode === 189) playRoot(ASHARP2);
  
  else if (keyCode === 187) playRoot(B2);
  
  else if (keyCode === 81) playRoot(C3);
  
  else if (keyCode === 87) playRoot(CSHARP3);
  
  else if (keyCode === 69) playRoot(D3);
  
  else if (keyCode === 82) playRoot(DSHARP3);
  
  else if (keyCode === 84) playRoot(E3);
  
  else if (keyCode === 89) playRoot(F3);
  
  else if (keyCode === 85) playRoot(FSHARP3);
  
  else if (keyCode === 73) playRoot(G3);
  
  else if (keyCode === 79) playRoot(GSHARP3);
  
  else if (keyCode === 80) playRoot(A3);
  
  else if (keyCode === 219) playRoot(ASHARP3);
  
  else if (keyCode === 221) playRoot(B3);
  
  else if (keyCode === 65) playRoot(C4);
  
  else if (keyCode === 83) playRoot(CSHARP4);
  
  else if (keyCode === 68) playRoot(D4);
  
  else if (keyCode === 70) playRoot(DSHARP4);
  
  else if (keyCode === 71) playRoot(E4);
  
  else if (keyCode === 72) playRoot(F4);
  
  else if (keyCode === 74) playRoot(FSHARP4);
  
  else if (keyCode === 75) playRoot(G4);
  
  else if (keyCode === 76) playRoot(GSHARP4);
  
  else if (keyCode === 186) playRoot(A4);
  
  else if (keyCode === 222) playRoot(ASHARP4);
  
  else if (keyCode === 13) playRoot(B4);
  
  else if (keyCode === 90) playRoot(C5);
  
  else if (keyCode === 88) playRoot(CSHARP5);
  
  else if (keyCode === 67) playRoot(D5);
  
  else if (keyCode === 86) playRoot(DSHARP5);
  
  else if (keyCode === 66) playRoot(E5);
  
  else if (keyCode === 78) playRoot(F5);
  
  else if (keyCode === 77) playRoot(FSHARP5);
  
  else if (keyCode === 188) playRoot(G5);
  
  else if (keyCode === 190) playRoot(GSHARP5);
  
  else if (keyCode === 191) playRoot(A5);
  
  else if (keyCode === 16) playRoot(ASHARP5);
  
  else if (keyCode === 35) playRoot(B5);
}

function keyReleased() {
  synth.triggerRelease();
  Tone.Transport.stop();
  // beat = 0;
  drawPlaybar = false;
}
  
function playRoot(note) {
  root = note;
  Tone.Transport.start();
  drawPlaybar = true;
}

function onBeat(time) {
  currentStep = beat % grid[0].length;
    if (tones[currentStep] >= 0) {
      //console.log('interval at current beat: ' + tones[currentStep]);
      let noteObject = Tone.Frequency(getScaleDegree(currentStep), "midi"); 
      synth.triggerAttackRelease(noteObject, time);  
      //console.log("beat: " + beat % grid[0].length);
  }
  else synth.triggerRelease();
  beat++; 
}

function toggleDelay() {
  if (delayActive == false)
  {
    synth.chain(delay, Tone.Master);
    delayActive = true;
  } 
  else
  {
    synth.chain(Tone.Master);
    delayActive = false;
  }
}

function addStep() {
  let newStep = [];
  for (let i = 0; i < grid[0].length; i++){
    let step = {
                    isActive: false,
                    shade: 255
                };
    newStep.push(step);
  }
  grid.unshift(newStep);
}

function removeStep() {
  grid.shift();
}

function addBeat() {
  for (let i = 0; i < grid.length; i++) {
     let step = {
                    isActive: false,
                    shade: 255
                };
    grid[i].push(step);
  }
}

function removeBeat() {
  for (let i = 0; i < grid.length; i++) {
    grid[i].pop();
  }
}

function printGrid() {
  let out = "";
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j].isActive) out += 1;
      else out += 0;
    } 
    out += "\n";
  }
  console.log(out);
}

function xPos(i, j) {
  return j * (canvasWidth/grid[0].length);
}

function yPos(i, j) {
  return i * (canvasHeight/grid.length);
}

function getWidth() {
  return canvasWidth / grid[0].length;
}

function getHeight() {
  return canvasHeight / grid.length;
}

function updateArray() {
  //if beat removed, remove last array element
  if (grid[0].length < tones.length)
    {
      let difference = tones.length - grid[0].length;
      for (let r = 0; r < difference; r++)
        {
          tones.pop();
        }
    }
  
  //if beat added, initialize to not active
  else if (grid[0].length > tones.length)
    {
      let difference = grid[0].length - tones.length;
      for (let r = 0; r < difference; r++)
        {
          tones.push(-1);
        }
    }
  
  //update array with which scale degree played on each beat
  for (let i = 0; i < grid[0].length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[j][i].isActive) 
      {
        //console.log("i: " + i + " j: " + j);
        tones[i] = grid.length - j - 1;
        break;
      }
      tones[i] = -1;
    } 
  }
  //console.log(tones);
}

function toggleKey() {
  if (playKey == major) playKey = minor;
  else playKey = major;
}

function printMidi() {
  out = "";
  for (let i = 0; i < grid[0].length; i++)
    {
      if (tones[i] >= 0) 
      {
        out += getScaleDegree(i) + " ";
      }
      else out += "NULL "
    }
  console.log("midi: " + out);
}

function getScaleDegree (index) {
  //console.log("interval: " + tones[index]);
  //console.log("octaves up: " + floor(tones[index] / 8));
  return root + (12 * floor(tones[index] / 7)) + playKey[tones[index] % 7];
}
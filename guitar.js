const fretboardContainer = document.getElementById('fretboard-container');
const openNotesContainer = document.querySelector('.open-notes-container');
const numStrings = 6;
const numFrets = 12;
const tuning = [82.41, 110, 146.83, 196, 246.94, 329.63]; // Standard tuning
const fretMarkers = [3, 5, 7, 9, 12];
const openNotes = ['E', 'B', 'G', 'D', 'A', 'E'];

const chords = {
    'a': [{ string: 0, fret: 0 }, { string: 1, fret: 0 }, { string: 2, fret: 2 }, { string: 3, fret: 2 }, { string: 4, fret: 2 }, { string: 5, fret: 0 }],
    'b': [{ string: 0, fret: -1 }, { string: 1, fret: 2 }, { string: 2, fret: 1 }, { string: 3, fret: 2 }, { string: 4, fret: 0 }, { string: 5, fret: 2 }],
    'c': [{ string: 0, fret: -1 }, { string: 1, fret: 3 }, { string: 2, fret: 2 }, { string: 3, fret: 0 }, { string: 4, fret: 1 }, { string: 5, fret: 0 }],
    'd': [{ string: 0, fret: -1 }, { string: 1, fret: -1 }, { string: 2, fret: 0 }, { string: 3, fret: 2 }, { string: 4, fret: 3 }, { string: 5, fret: 2 }],
    'e': [{ string: 0, fret: 0 }, { string: 1, fret: 2 }, { string: 2, fret: 2 }, { string: 3, fret: 1 }, { string: 4, fret: 0 }, { string: 5, fret: 0 }],
    'f': [{ string: 0, fret: -1 }, { string: 1, fret: -1 }, { string: 2, fret: 3 }, { string: 3, fret: 2 }, { string: 4, fret: 1 }, { string: 5, fret: 1 }],
    'g': [{ string: 0, fret: 3 }, { string: 1, fret: 2 }, { string: 2, fret: 0 }, { string: 3, fret: 0 }, { string: 4, fret: 0 }, { string: 5, fret: 3 }]
};

const minorChords = {
    'a': [{ string: 0, fret: 0 }, { string: 1, fret: 0 }, { string: 2, fret: 2 }, { string: 3, fret: 2 }, { string: 4, fret: 1 }, { string: 5, fret: 0 }],
    'b': [{ string: 0, fret: -1 }, { string: 1, fret: 2 }, { string: 2, fret: 4 }, { string: 3, fret: 4 }, { string: 4, fret: 3 }, { string: 5, fret: -1 }],
    'c': [{ string: 0, fret: -1 }, { string: 1, fret: 3 }, { string: 2, fret: 5 }, { string: 3, fret: 5 }, { string: 4, fret: 4 }, { string: 5, fret: -1 }],
    'd': [{ string: 0, fret: -1 }, { string: 1, fret: -1 }, { string: 2, fret: 0 }, { string: 3, fret: 2 }, { string: 4, fret: 3 }, { string: 5, fret: 1 }],
    'e': [{ string: 0, fret: 0 }, { string: 1, fret: 2 }, { string: 2, fret: 2 }, { string: 3, fret: 0 }, { string: 4, fret: 0 }, { string: 5, fret: 0 }],
    'f': [{ string: 0, fret: 1 }, { string: 1, fret: 3 }, { string: 2, fret: 3 }, { string: 3, fret: 1 }, { string: 4, fret: 1 }, { string: 5, fret: 1 }],
    'g': [{ string: 0, fret: 3 }, { string: 1, fret: 5 }, { string: 2, fret: 5 }, { string: 3, fret: 3 }, { string: 4, fret: 3 }, { string: 5, fret: 3 }]
};

// Create open string labels
openNotes.forEach((noteName, index) => {
    const label = document.createElement('div');
    label.classList.add('open-note-label');
    label.textContent = noteName;
    const stringIndex = 5 - index;
    label.dataset.string = stringIndex;
    label.addEventListener('click', () => playNote(stringIndex, 0));
    openNotesContainer.appendChild(label);
});

// Create strings and frets
for (let s = numStrings - 1; s >= 0; s--) {
  const stringContainer = document.createElement('div');
  stringContainer.classList.add('string-container');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('string-svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('id', `string-path-${s}`);
  path.setAttribute('d', 'M 0 20 L 2000 20'); // Initial path
  svg.appendChild(path);
  stringContainer.appendChild(svg);

  const noteContainer = document.createElement('div');
  noteContainer.classList.add('string');
  
  for (let f = 1; f <= numFrets; f++) {
    const note = document.createElement('div');
    note.classList.add('note');
    note.dataset.string = s;
    note.dataset.fret = f;
    note.style.flexBasis = `${100 / numFrets}%`;

    note.addEventListener('click', () => playNote(s, f));

    const fretMarker = document.createElement('div');
    fretMarker.classList.add('fret-marker');
    note.appendChild(fretMarker);

    if (fretMarkers.includes(f)) {
        if (f === 12) {
            if (s === 1 || s === 4) {
                const dot = document.createElement('div');
                dot.classList.add('fret-dot');
                note.appendChild(dot);
            }
        } else {
            if (s === 2) {
                const dot = document.createElement('div');
                dot.classList.add('fret-dot');
                note.appendChild(dot);
            }
        }
    }
    noteContainer.appendChild(note);
  }
  stringContainer.appendChild(noteContainer);
  fretboardContainer.appendChild(stringContainer);
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playNote(string, fret) {
  if (!audioCtx || fret === -1) return;
  animateString(string, fret);

  const baseFreq = tuning[string];
  const freq = baseFreq * Math.pow(2, fret / 12);

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 1.5);
}

let animationFrameIds = {};
function animateString(string, fret) {
    const path = document.getElementById(`string-path-${string}`);
    const fretboardWidth = fretboardContainer.offsetWidth;
    const fretWidth = fretboardWidth / numFrets;
    const startX = fret * fretWidth;

    let startTime = null;
    const duration = 1000; // 1 second animation

    const draw = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        const decay = Math.exp(-elapsed / (duration / 4));
        let d = `M 0 20`;

        for (let x = 1; x < fretboardWidth; x++) {
            let yOffset = 0;
            if (x > startX) {
                const relativeX = x - startX;
                const wiggleFactor = (relativeX / (fretboardWidth - startX));
                yOffset = wiggleFactor * Math.sin(relativeX / 10) * 10 * decay;
            }
            d += ` L ${x} ${20 + yOffset}`;
        }

        path.setAttribute('d', d);

        if (elapsed < duration) {
            animationFrameIds[string] = requestAnimationFrame(draw);
        } else {
            path.setAttribute('d', `M 0 20 L ${fretboardWidth} 20`);
            delete animationFrameIds[string];
        }
    };

    if (animationFrameIds[string]) {
        cancelAnimationFrame(animationFrameIds[string]);
    }
    animationFrameIds[string] = requestAnimationFrame(draw);
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (e.shiftKey && minorChords[key]) {
        playChord(minorChords[key]);
    } else if (chords[key]) {
        playChord(chords[key]);
    }
});

function playChord(chord) {
    chord.forEach((note, index) => {
        if (note.fret === -1) return;
        setTimeout(() => {
            playNote(note.string, note.fret);
            highlightNote(note.string, note.fret);
        }, index * 50); // Strumming effect
    });
}

function highlightNote(string, fret) {
    let element;
    if (fret === 0) {
        element = document.querySelector(`.open-note-label[data-string="${string}"]`);
    } else {
        element = document.querySelector(`.note[data-string="${string}"][data-fret="${fret}"]`);
    }

    if (element) {
        element.classList.add('highlight');
        setTimeout(() => {
            element.classList.remove('highlight');
        }, 500); // Highlight duration
    }
}
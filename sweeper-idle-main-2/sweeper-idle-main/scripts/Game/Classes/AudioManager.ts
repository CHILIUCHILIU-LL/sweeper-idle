export class AudioManager {
    private context: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private playing: boolean = false;
    private noteIndex: number = 0;
    private nextNoteTime: number = 0;
    private schedulerTimer: number | null = null;

    private notes: number[] = [
        261.63, 293.66, 329.63, 392.00, 440.00,
        392.00, 329.63, 293.66, 261.63, 220.00,
        261.63, 329.63, 392.00, 440.00, 392.00,
        329.63, 293.66, 261.63, 220.00, 261.63
    ];

    private tempo: number = 0.4;

    constructor() {
    }

    private init() {
        if (this.context) return;
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.context = new AudioCtx() as AudioContext;
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = 0.15;
        this.gainNode.connect(this.context.destination);
    }

    toggle() {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.init();
        if (!this.context) return;
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        this.playing = true;
        this.nextNoteTime = this.context.currentTime;
        this.startScheduler();
    }

    pause() {
        this.playing = false;
        this.stopScheduler();
    }

    isPlaying(): boolean {
        return this.playing;
    }

    private startScheduler() {
        this.stopScheduler();
        this.schedulerTimer = window.setInterval(() => this.scheduleNotes(), 100);
    }

    private stopScheduler() {
        if (this.schedulerTimer !== null) {
            window.clearInterval(this.schedulerTimer);
            this.schedulerTimer = null;
        }
    }

    private scheduleNotes() {
        if (!this.playing || !this.context) return;
        const lookAhead = 0.2;
        while (this.nextNoteTime < this.context.currentTime + lookAhead) {
            this.playNote(this.notes[this.noteIndex], this.nextNoteTime);
            this.noteIndex = (this.noteIndex + 1) % this.notes.length;
            this.nextNoteTime += this.tempo;
        }
    }

    private playNote(frequency: number, time: number) {
        if (!this.context || !this.gainNode) return;
        const osc = this.context.createOscillator();
        const noteGain = this.context.createGain();

        osc.type = 'triangle';
        osc.frequency.value = frequency;

        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(0.3, time + 0.05);
        noteGain.gain.linearRampToValueAtTime(0, time + this.tempo * 0.9);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(time);
        osc.stop(time + this.tempo);
    }
}

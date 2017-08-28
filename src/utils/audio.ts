/*global Synthos, Note*/
const synthesizer = new Synthos();
const notes = new Note();

synthesizer.addFrequency(notes.E);

// TODO Mario - http://tabnabber.com/view_Tab.asp?tabID=5094&sArtist=Super+Mario&sName=theme+song

export const playNote = function(frequency:number) {
  if (frequency) {
    synthesizer.frequencies = [frequency];
    synthesizer.play()
  }
}

export const configureSynth = function({ type='sine', duration=0.3 }) {
  synthesizer.setType(type);
  synthesizer.setDurations([duration]); // TODO The perfect duration would prevent clicking
}

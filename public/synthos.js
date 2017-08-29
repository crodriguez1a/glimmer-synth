// TODO fork this

(function (root) {
  /*
   * Initialize
   */

  function Synth () {
    this.context = new AudioContext()
    this.modulators = []
    this.noise = {
      node: null,
      started: false
    }
  }

  /*
   * Some presets - static properties on Synth
   */

  Synth.presets = {

    kick: {
      type: 'sine',
      frequency: 100,
      duration: 0.05,
      volume: 1,
      ramp: {
        to: 70
      },
      env: {
        decay: 0.5
      }
    },
    hat: {
      type: 'square',
      frequency: 0,
      duration: 0.05,
      volume: 0.05,
      whiteNoise: true,
      env: {
        decay: 0.5
      },
      filter: {
        type: 'highpass',
        frequency: 60,
        gain: 20
      }
    },
    beeper: {
      type: 'triangle',
      frequency: 440,
      duration: 0.2,
      vol: 1,
      filter: {
        frequency: 1000,
        type: 'highpass',
        gain: 25
      },
      env: {
        decay: 15
      }
    },
    rest: {
      type: 'sine',
      vol: 0.0,
      frequency: 0
    }
  }

  /*
   * Add modulator to current synth
   */

  Synth.prototype.addModulator = function (modulator) {
    var carrier
    var mod = new Modulator(this.context, modulator.type, modulator.freq, modulator.gain)

    if (this.carrier) {
      carrier = this.modulators.length ? this.modulators[this.modulators.length - 1].osc : this.carrier
      mod.gainNode.connect(carrier.frequency)
    }
    this.modulators.push(mod)
    return mod
  }

  /*
   * Set global synth gain
   */

  Synth.prototype.gain = function (gain) {
    if (this.gainNode) {
      this.gainNode.gain.value = gain
    } else {
      console.warn('No gainNode initialized')
    }
  }

  // https://codepen.io/gregh/pen/OWrjOb?editors=0010
  function makeDistortionCurve( amount ) {
    var k = typeof amount === 'number' ? amount : 0,
      n_samples = 100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 10 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  };

  /*
   *  Accepts a "sound" object and plays it
   */

  Synth.prototype.play = function (sound) {
    var filter
    var chainableNode

    this.carrier = setupCarrier(sound, this.context)

    this.gainNode = this.context.createGain()
    this.gainNode.gain.value = sound.volume || 1

    this.dist = this.context.createWaveShaper();

    this.carrier.connect(this.gainNode)
    this.gainNode.connect(this.dist)
    this.dist.connect(this.context.destination);

    this.dist.curve = makeDistortionCurve(10000);

    chainableNode = this.gainNode

      // Make white noise
    if (sound.whiteNoise) {
      this.noise.node = addNoise(this.context, this)
    }

      // Bend frequency over time
    if (sound.ramp) {
      this.carrier.frequency.linearRampToValueAtTime(
          sound.ramp.to,
          this.context.currentTime + sound.duration
        )
    }

      // Apply filter if requested
    if (sound.filter) {
      filter = this.context.createBiquadFilter()

      filter.type = sound.filter.type || warn('Filter "type" is required')
      filter.frequency.value = sound.filter.frequency || warn('Filter "frequency" is required')
      filter.gain.value = sound.filter.gain || warn('Filter "gain" is required')

      chainableNode.connect(filter)
      chainableNode = filter
    }

    chainableNode.connect(this.context.destination)
    this.start(sound)

    if (sound.duration) {
      // this.stop(sound)
      // NOTE Custom http://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
      this.gainNode.gain.setTargetAtTime(0, this.context.currentTime, sound.duration);
    }
  }

  /*
   * Start sound
   */

  Synth.prototype.start = function (sound) {
    if (sound && sound.env && sound.env.attack) {
      var attackPeak = this.context.currentTime + ((sound.env.attack / 100) * sound.duration) || sound.vol
      var volume = sound.vol || 1

      this.gain(0)
      this.gainNode.gain.setValueAtTime(0.0, this.context.currentTime)
      this.gainNode.gain.linearRampToValueAtTime(volume, attackPeak)
    }

    connectModulators(this)
    this.carrier.start(this.context.currentTime)
  }

  /*
   * Stop all sound from current synth
   */

  Synth.prototype.stop = function (sound) {
    var endTime = 0

    if (sound && sound.env && sound.env.decay) {
      var decay = (sound.env.decay / 100) * sound.duration
      endTime = this.context.currentTime + sound.duration + decay
      this.gainNode.gain.setTargetAtTime(0.0, endTime, 0.1)
    } else if (sound && sound.duration) {
      endTime = this.context.currentTime + sound.duration
      this.carrier.stop(endTime)
      this.gainNode.gain.setValueAtTime(0.0, endTime)
    } else {
      this.gain(0)
    }

    this.modulators.length = 0
  }

  /*
   *  Calculates BPM
   */

  Synth.prototype.calculateBpm = function (bpm) {
    var second = 1000
    var minute = second * 60
    var bpms = minute / bpm

    return bpms
  }

  /*
   *  Accepts an array of sounds to sequence and a bpm
   */

  Synth.prototype.sequence = function (queue, bpm, loops) {
     // Get BPM delay in milliseconds
    var calculatedBpm = this.calculateBpm(bpm)

      // Play each sound, then wait for the offset
    for (var i = 0; i < queue.length; i++) {
      ((function (offset) {
        setTimeout(function () {
          this.play(queue[offset])
        }.bind(this), offset * calculatedBpm)
      }).bind(this))(i)
    }
  }

  /* --------------- *
   * Private Methods *
   * --------------- */

    // A modulator have a this.carrierillator and a gain
  function Modulator (context, type, freq, gain) {
    this.osc = context.createOscillator()
    this.gainNode = context.createGain()
    this.osc.type = type
    this.osc.frequency.value = freq
    this.gainNode.gain.value = gain
    this.osc.connect(this.gainNode)
    this.osc.start(0)
  }

    // Connects all Modulators
  function connectModulators (synth) {
    var carrier = synth.carrier

    synth.modulators.length && synth.modulators.forEach(function (mod) {
      mod.gainNode.connect(carrier.frequency)
      carrier = mod.osc
    })
  }

    // Noise can be added to sound
  function addNoise (context, synth) {
    var noise = context.createBufferSource()
    var channels = 2
    var frameCount = context.sampleRate * 2.0
    var bufferNode = context.createBuffer(2, frameCount, context.sampleRate)

    for (var channel = 0; channel < channels; channel++) {
      var nowBuffering = bufferNode.getChannelData(channel)

      for (var i = 0; i < frameCount; i++) {
        nowBuffering[i] = Math.random() * 2 - 1
      }
    }

    noise.buffer = bufferNode
    noise.connect(synth.gainNode)
    noise.loop = true
    noise.start(context.currentTime)

    return noise
  };

    // Set up carrier oscillator node
  function setupCarrier (sound, context) {
    var carrier = context.createOscillator()

    carrier.type = sound.type
    carrier.frequency.setValueAtTime(sound.frequency, context.currentTime)

    return carrier
  }

    // Issue warning and return 0.0
  function warn (message) {
    console.warn(message)
    return 0.0
  }

  root.Synth = Synth
})(window)

class Note {
  constructor () {
    this.C = 130.81
    this.Cs = 138.59
    this.D = 146.83
    this.Ds = 155.56
    this.E = 164.81
    this.F = 174.61
    this.Fs = 185.00
    this.G = 196.00
    this.Gs = 207.65
    this.A = 220.00
    this.As = 233.08
    this.B = 246.94
    this.E5 = 261.63
    this.Ds5 = 277.18
    this.C5 = 293.66
    this.B4 = 493.883
  }
}

class Synthos {
  constructor () {
    this.mySynth = new Synth()
    this.frequencies = []
    this.durations = []
    this.bpm = 200
    this.loops = 1
    this.track = []
    this.type = 'triangle'
    this.duration = 0.2
  }
  setBpm (bpm) {
    this.bpm = bpm
  }

  setDurations(durations){
    this.durations = durations
  }

  setFrequencies (frequencies) {
    this.frequencies = frequencies
  }

  setDuration (duration) {
    this.duration = duration
  }

  setType (type) {
    this.type = type
  }
  addFrequency (frequency) {
    this.frequencies[this.frequencies.length] = frequency
  }

  play ({ filter='lowpass' }) {
    for (var index = 0; index < this.frequencies.length; index++) {
      this.track[index] = {
        type: this.type,
        frequency: this.frequencies[index],
        duration: this.durations[index],
        filter: {
          frequency: 1000,
          type: filter, // highpass lowpass bandpass lowshelf highshelf peaking notch allpass
          gain: 25
        }
      }
    }
    this.mySynth.sequence(this.track, this.bpm, this.loops)
  }
}

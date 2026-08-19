// Web Audio API Sound Synthesizer Engine for LEARN ZONE

class SoundEngine {
  private ctx: AudioContext | null = null
  private ambientSource: AudioNode | null = null
  private ambientGain: GainNode | null = null
  private isAmbientPlaying = false
  private currentAmbientType: string = 'none'

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  // Cheerful chime when a task is marked complete
  playTaskStarSound(soundEnabled = true) {
    if (!soundEnabled) return
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc2.type = 'triangle'

      // G5 (783.99Hz) -> C6 (1046.5Hz) sparkle
      osc1.frequency.setValueAtTime(784, now)
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12)
      osc2.frequency.setValueAtTime(1174.66, now + 0.05) // D6 accent

      gain.gain.setValueAtTime(0.01, now)
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now + 0.05)
      osc1.stop(now + 0.35)
      osc2.stop(now + 0.35)
    } catch {
      // Ignore if audio not unlocked yet
    }
  }

  // 100% Goal Celebration fanfare
  playGoalFanfare(soundEnabled = true) {
    if (!soundEnabled) return
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      const delays = [0, 0.12, 0.24, 0.4]

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteTime = now + delays[i]

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, noteTime)

        gain.gain.setValueAtTime(0.001, noteTime)
        gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + (i === 3 ? 0.7 : 0.25))

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(noteTime)
        osc.stop(noteTime + (i === 3 ? 0.7 : 0.25))
      })
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Pomodoro Alarms
  playAlarm(type: 'school_bell' | 'cheerful' | 'nature', soundEnabled = true) {
    if (!soundEnabled) return
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      if (type === 'school_bell') {
        const bellNotes = [
          { freq: 659.25, time: 0 },    // E5
          { freq: 523.25, time: 0.45 }, // C5
          { freq: 783.99, time: 0.9 },  // G5
        ]

        bellNotes.forEach(({ freq, time }) => {
          const t = now + time
          const osc1 = ctx.createOscillator()
          const osc2 = ctx.createOscillator()
          const gain = ctx.createGain()

          osc1.type = 'sine'
          osc1.frequency.setValueAtTime(freq, t)
          osc2.type = 'sine'
          osc2.frequency.setValueAtTime(freq * 2.76, t) // Metallic overtone

          gain.gain.setValueAtTime(0.25, t)
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7)

          osc1.connect(gain)
          osc2.connect(gain)
          gain.connect(ctx.destination)

          osc1.start(t)
          osc2.start(t)
          osc1.stop(t + 0.7)
          osc2.stop(t + 0.7)
        })
      } else if (type === 'cheerful') {
        const arpeggio = [523.25, 659.25, 783.99, 987.77, 1046.5]
        arpeggio.forEach((freq, idx) => {
          const t = now + idx * 0.15
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()

          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, t)

          gain.gain.setValueAtTime(0.2, t)
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)

          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(t)
          osc.stop(t + 0.4)
        })
      } else {
        const freqs = [392, 587.33, 880]
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()

          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, now)

          gain.gain.setValueAtTime(0.18, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6)

          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(now)
          osc.stop(now + 1.6)
        })
      }
    } catch {
      // Audio playback error handling
    }
  }

  // Background Ambient Sound Generator (Soft Rain & Instrumental Pad)
  startBackgroundAudio(type: 'instrumental' | 'soft_rain' | 'none', soundEnabled = true) {
    if (!soundEnabled || type === 'none') {
      this.stopBackgroundAudio()
      return
    }

    if (this.isAmbientPlaying && this.currentAmbientType === type) {
      return
    }

    this.stopBackgroundAudio()

    try {
      const ctx = this.getContext()
      this.currentAmbientType = type
      this.isAmbientPlaying = true

      if (type === 'soft_rain') {
        const bufferSize = 2 * ctx.sampleRate
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.96900 * b2 + white * 0.1538520
          b3 = 0.86650 * b3 + white * 0.3104856
          b4 = 0.55000 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.0168980
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04
          b6 = white * 0.115926
        }

        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(800, ctx.currentTime)

        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime)

        whiteNoise.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        whiteNoise.start()
        this.ambientSource = whiteNoise
        this.ambientGain = gainNode
      } else if (type === 'instrumental') {
        const freqs = [130.81, 196.0, 246.94, 293.66, 392.0]
        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime)
        gainNode.connect(ctx.destination)

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(450, ctx.currentTime)
        filter.connect(gainNode)

        const oscillators: OscillatorNode[] = []

        freqs.forEach((freq) => {
          const osc = ctx.createOscillator()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, ctx.currentTime)
          osc.connect(filter)
          osc.start()
          oscillators.push(osc)
        })

        this.ambientGain = gainNode
        this.ambientSource = {
          disconnect: () => {
            oscillators.forEach(osc => {
              try { osc.stop(); osc.disconnect() } catch {}
            })
            filter.disconnect()
          }
        } as unknown as AudioNode
      }
    } catch {
      this.isAmbientPlaying = false
    }
  }

  stopBackgroundAudio() {
    if (this.ambientSource) {
      try {
        if ('stop' in this.ambientSource && typeof (this.ambientSource as AudioBufferSourceNode).stop === 'function') {
          (this.ambientSource as AudioBufferSourceNode).stop()
        }
        this.ambientSource.disconnect()
      } catch {}
      this.ambientSource = null
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect()
      } catch {}
      this.ambientGain = null
    }
    this.isAmbientPlaying = false
    this.currentAmbientType = 'none'
  }
}

export const audioService = new SoundEngine()

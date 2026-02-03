import { useEffect, useRef } from 'react'
import { useTimerStore } from '../store/useTimerStore'

const SOUND_URLS: Record<string, string> = {
  'white-noise': 'https://assets.mixkit.co/active_storage/sfx/2391/2391-preview.mp3',
  'rain': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder for rain
  'cafe': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder for cafe
}

export const AmbientAudio = () => {
  const { ambientSound, customSound, volume, isRunning } = useTimerStore()
  const audioRef = useRef<HTMLAudioElement>(new Audio())

  useEffect(() => {
    const audio = audioRef.current
    audio.loop = true
    
    let sourceUrl = ''
    if (ambientSound === 'custom' && customSound.url) {
      sourceUrl = customSound.url
    } else if (ambientSound && SOUND_URLS[ambientSound]) {
      sourceUrl = SOUND_URLS[ambientSound]
    }

    if (sourceUrl) {
      if (audio.src !== sourceUrl) {
        audio.src = sourceUrl
        audio.load()
      }
      
      if (isRunning) {
        audio.play().catch(e => console.log("Audio play blocked", e))
      } else {
        audio.pause()
      }
    } else {
      audio.pause()
      audio.src = ''
    }
  }, [ambientSound, customSound.url, isRunning])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  return null
}

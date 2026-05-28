import { useState, useEffect, useRef, useCallback } from 'react';

export default function useAudioPlayer(playlist, playMode, getAudioPath) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      setProgress(audio.currentTime / (audio.duration || 1));
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', next);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', next);
    };
  }, []);

  const track = playlist[currentTrackIndex] || { title: 'No track', artist: '', file: '' };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!audioRef.current.src) {
        audioRef.current.src = getAudioPath ? getAudioPath(track.file) : `/audio/${track.file}`;
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const next = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    audioRef.current.src = getAudioPath ? getAudioPath(playlist[nextIndex].file) : `/audio/${playlist[nextIndex].file}`;
    audioRef.current.play();
    setIsPlaying(true);
  }, [currentTrackIndex, playlist]);

  const prev = useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
    audioRef.current.src = getAudioPath ? getAudioPath(playlist[prevIndex].file) : `/audio/${playlist[prevIndex].file}`;
    audioRef.current.play();
    setIsPlaying(true);
  }, [currentTrackIndex, playlist]);

  const seek = (pct) => {
    audioRef.current.currentTime = pct * audioRef.current.duration;
    setProgress(pct);
  };

  const toggleMute = () => {
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  return {
    track,
    isPlaying,
    progress,
    duration,
    currentTime: audioRef.current.currentTime,
    togglePlay,
    next,
    prev,
    seek,
    volume,
    setVolume,
    muted,
    toggleMute
  };
}

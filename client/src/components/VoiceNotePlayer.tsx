import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, FastForward, Volume2 } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioUrl: string;
  duration?: number;
  isMe?: boolean;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Generates consistent pseudo-random bar heights based on a seed
const generateWaveformHeights = (count: number, seedStr: string): number[] => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.sin(hash + i * 1.7) * 10000;
    const val = Math.floor((x - Math.floor(x)) * 70) + 30; // 30% to 100% height
    heights.push(val);
  }
  return heights;
};

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  duration: initialDuration,
  isMe = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const barHeights = React.useMemo(
    () => generateWaveformHeights(32, audioUrl.slice(-30) || 'default-audio'),
    [audioUrl]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoaded(true);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio playback error:', err));
    }
  };

  const handleSeek = (index: number) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    const progressRatio = index / barHeights.length;
    const seekTo = progressRatio * duration;
    audio.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const currentProgress = duration > 0 ? currentTime / duration : 0;

  return (
    <div
      className={`flex flex-col gap-1.5 py-1 select-none min-w-[220px] sm:min-w-[270px] max-w-[340px]`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Play / Pause Circular Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer active:scale-90 ${
            isMe
              ? 'bg-white text-emerald-800 hover:bg-emerald-50 shadow-black/20'
              : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-700/20'
          }`}
          title={isPlaying ? 'Pause' : 'Play voice note'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Visualizer with Click-to-seek */}
        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
          <div
            className="flex items-center gap-[2.5px] h-7 cursor-pointer py-1"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              if (audioRef.current && duration > 0) {
                audioRef.current.currentTime = ratio * duration;
                setCurrentTime(ratio * duration);
              }
            }}
          >
            {barHeights.map((h, i) => {
              const barProgress = i / barHeights.length;
              const isPlayed = barProgress <= currentProgress;

              return (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeek(i);
                  }}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-full transition-all duration-75 ${
                    isMe
                      ? isPlayed
                        ? 'bg-white'
                        : 'bg-white/40 hover:bg-white/70'
                      : isPlayed
                      ? 'bg-emerald-700'
                      : 'bg-emerald-200 hover:bg-emerald-300'
                  }`}
                />
              );
            })}
          </div>

          {/* Time & Speed Row */}
          <div
            className={`flex items-center justify-between text-[10px] font-mono tracking-wider ${
              isMe ? 'text-white/85' : 'text-gray-500'
            }`}
          >
            <span className="font-semibold">
              {isPlaying || currentTime > 0
                ? formatTime(currentTime)
                : formatTime(duration || initialDuration || 0)}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={cycleSpeed}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-normal transition-all cursor-pointer ${
                  isMe
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Change playback speed"
              >
                {playbackRate}x
              </button>
              <Volume2 className="w-3 h-3 opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';

interface VoiceMessageRecorderProps {
  onSendVoice: (audioUrl: string, duration: number) => Promise<void> | void;
  disabled?: boolean;
  buttonClassName?: string;
  theme?: 'consumer' | 'merchant';
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  onSendVoice,
  disabled = false,
  buttonClassName = '',
  theme = 'consumer',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  // Maximum recording time: 2 minutes
  const MAX_RECORDING_TIME = 120;

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, []);

  const cleanupMedia = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const startRecording = async () => {
    if (disabled || isSending) return;
    setErrorMessage(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Audio recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Detect supported mime type
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalType = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start(200); // Collect data every 200ms
      setIsRecording(true);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else {
        setErrorMessage('Could not start audio recording. Please check your microphone.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const cancelRecording = () => {
    stopRecording();
    cleanupMedia();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPreviewPlaying(false);
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current && audioUrl) {
      previewAudioRef.current = new Audio(audioUrl);
      previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
    }

    if (previewAudioRef.current) {
      if (isPreviewPlaying) {
        previewAudioRef.current.pause();
        setIsPreviewPlaying(false);
      } else {
        previewAudioRef.current.play();
        setIsPreviewPlaying(true);
      }
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSend = async () => {
    if (!audioBlob || isSending) return;
    setIsSending(true);
    setErrorMessage(null);

    try {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const dataUrl = await blobToBase64(audioBlob);
      const duration = Math.max(1, recordingTime);
      await onSendVoice(dataUrl, duration);
      cancelRecording();
    } catch (err: any) {
      console.error('Failed to send voice note:', err);
      setErrorMessage(err.message || 'Failed to send voice message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. Idle Mode: Show Record Audio Mic Button
  if (!isRecording && !audioBlob) {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled || isSending}
          className={
            buttonClassName ||
            `p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 min-w-[42px] min-h-[42px] active:scale-95 ${
              theme === 'merchant'
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 hover:border-blue-300'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow-md'
            }`
          }
          title="വോയ്സ് മെസ്സേജ് റെക്കോർഡ് ചെയ്യുക (Record Voice Message)"
        >
          <Mic className="w-4 h-4" />
        </button>

        {errorMessage && (
          <div className="absolute bottom-full mb-2 left-0 z-50 bg-red-600 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg max-w-xs flex items-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Active Recording State Toolbar
  if (isRecording) {
    return (
      <div className="flex-1 flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl px-3 py-2 animate-in fade-in duration-150">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>

          <span className="font-mono font-bold text-red-700 text-xs sm:text-sm">
            {formatTimer(recordingTime)}
          </span>

          {/* Animated sound wave bars */}
          <div className="hidden sm:flex items-center gap-1 h-4">
            {[40, 80, 50, 100, 60, 90, 70, 30].map((h, i) => (
              <div
                key={i}
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                }}
                className="w-1 bg-red-500 rounded-full animate-pulse"
              />
            ))}
          </div>

          <span className="text-[11px] text-red-600 font-medium font-malayalam truncate">
            റെക്കോർഡിംഗ് നടക്കുന്നു...
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Discard Button */}
          <button
            type="button"
            onClick={cancelRecording}
            className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
            title="റദ്ദാക്കുക (Discard recording)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Stop & Preview Button */}
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="റെക്കോർഡിംഗ് നിർത്തുക"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Done</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Audio Preview State before sending
  return (
    <div className="flex-1 flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-300/90 rounded-xl sm:rounded-2xl px-3 py-1.5 animate-in fade-in duration-150">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={togglePreviewPlay}
          className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 transition-colors cursor-pointer shrink-0 shadow-xs"
          title={isPreviewPlaying ? 'Pause preview' : 'Play recorded voice'}
        >
          {isPreviewPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold text-emerald-950 font-malayalam truncate">
            🎙️ വോയ്സ് നോട്ട് റെഡി ({formatTimer(recordingTime)})
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">
            കേട്ടുനോക്കി അയക്കാം
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={cancelRecording}
          disabled={isSending}
          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="ഡിലീറ്റ് ചെയ്യുക (Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          title="വോയ്സ് മെസ്സേജ് അയക്കുക (Send Voice Note)"
        >
          {isSending ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

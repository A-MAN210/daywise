import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Check,
  RotateCcw,
  X,
  Radio,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceJournalAssistantProps {
  onTranscriptCaptured: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceJournalAssistant({
  onTranscriptCaptured,
  isOpen,
  onClose,
}: VoiceJournalAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTrans = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTrans += item[0].transcript + " ";
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => (prev ? `${prev} ${finalTrans.trim()}` : finalTrans.trim()));
        }
        setInterimText(currentInterim);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone permission was denied. Please allow microphone access to speak.");
        } else if (event.error !== "no-speech") {
          setErrorMsg(`Voice recognition notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("SpeechRecognition init error:", e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorMsg(null);
    if (!recognitionRef.current) {
      setErrorMsg("Voice capture is not supported in this browser.");
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Could not start recognition:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleAppendToJournal = () => {
    const fullText = `${transcript} ${interimText}`.trim();
    if (fullText) {
      onTranscriptCaptured(fullText);
    }
    stopListening();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#E9E8F2] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0EEF6] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1EFFF] text-[#6D5DFB]">
              <Mic className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-extrabold text-[#26243A]">
                Voice Assistant for Journaling
              </h3>
              <p className="text-xs text-[#8E8B9E]">Speak your reflections — automatically transcribed</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="rounded-xl p-1.5 text-[#A09DB7] hover:bg-[#F6F4FF]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Listening Status & Waveform Indicator */}
        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl bg-[#292741] p-6 text-white text-center">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <span className="absolute h-20 w-20 animate-ping rounded-full bg-[#6D5DFB]/40" />
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl transition transform active:scale-95 ${
                isListening ? "bg-[#E74C3C]" : "bg-[#6D5DFB] hover:bg-[#5949E8]"
              }`}
            >
              {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </button>
          </div>

          <div className="mt-4 font-display text-base font-extrabold">
            {isListening ? "Listening to your voice..." : "Tap the microphone to speak"}
          </div>
          <p className="mt-1 text-xs text-[#B9B5DB]">
            {isListening
              ? "Speak naturally about your day, wins, thoughts, or next steps."
              : "Zero typing needed. Hands-free stream into your journal archive."}
          </p>

          {/* Animated Waveform Bars when listening */}
          {isListening && (
            <div className="mt-4 flex items-center gap-1.5">
              {[40, 75, 95, 60, 85, 50, 90, 70, 45, 80].map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-[#F4BC56] animate-pulse"
                  style={{
                    height: `${h * 0.3}px`,
                    animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Transcription Box */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#A09DB7]">
            <span>Transcribed Reflection</span>
            {transcript && (
              <button
                onClick={() => {
                  setTranscript("");
                  setInterimText("");
                }}
                className="text-xs text-[#E96E58] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-2 min-h-[110px] max-h-[180px] overflow-y-auto rounded-2xl border border-[#E7E5F0] bg-[#FBFAFE] p-4 text-sm leading-6 text-[#26243A]">
            {transcript || interimText ? (
              <div>
                <span>{transcript}</span>
                {interimText && <span className="text-[#8E8B9E] italic"> {interimText}</span>}
              </div>
            ) : (
              <span className="text-[#B3B0BF] italic text-xs">
                Your transcribed words will appear here in real time as you speak...
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFF0EC] p-3 text-xs font-bold text-[#E74C3C]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isSupported && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFF9EC] p-3 text-xs font-bold text-[#D35400]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Voice speech recognition is best supported on Chrome, Edge, and Safari. You can still type directly in the journal.
            </span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-[#F0EEF6] pt-4">
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="rounded-xl px-4 py-2 text-xs font-extrabold text-[#77748F] hover:bg-[#F8F8FC]"
          >
            Cancel
          </button>
          <Button
            onClick={handleAppendToJournal}
            disabled={!transcript && !interimText}
            className="h-10 rounded-xl bg-[#6D5DFB] px-5 text-xs font-extrabold text-white shadow-md hover:bg-[#5949E8] disabled:opacity-50"
          >
            <Check className="mr-1.5 h-4 w-4" /> Insert into Journal
          </Button>
        </div>
      </div>
    </div>
  );
}

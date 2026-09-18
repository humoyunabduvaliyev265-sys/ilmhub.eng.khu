/**
 * Speech utilities for ILMHUB ENGLISH
 * Provides browser Web Speech API text-to-speech and speech-to-text
 */

export function speakEnglishText(text: string, onEnd?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any active speech

    // Remove emoji and markdown artifacts for clean pronunciation
    const cleanText = text
      .replace(/💡 Quick Correction:/g, "Quick correction.")
      .replace(/[#*_`]/g, "")
      .replace(/→/g, "becomes")
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.95; // Slightly measured for English learners

    // Try to pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang === "en-US" && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error("Speech synthesis failed:", err);
    return false;
  }
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

export function createSpeechRecognizer(
  onResult: (text: string, isFinal: boolean) => void,
  onError: (err: string) => void,
  onEnd: () => void
): any {
  if (!isSpeechRecognitionSupported()) {
    onError("Speech recognition is not supported in this browser.");
    return null;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript, true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn("Speech recognition error:", event.error);
    onError(event.error === "not-allowed" ? "Microphone permission denied." : `Speech error: ${event.error}`);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}

export function isSpeechRecognitionSupported(): boolean {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

export async function transcribeAudioSegment(
  audioUrl: string,
  startTime: number,
  endTime: number
): Promise<string> {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error('Speech Recognition API is not supported in this browser');
  }

  const recognition = new SpeechRecognition();
  const audio = new Audio(audioUrl);

  return new Promise((resolve, reject) => {
    let transcript = '';
    let recognitionStarted = false;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    recognition.onstart = () => {
      recognitionStarted = true;
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcript += text + ' ';
        }
      }
    };

    recognition.onerror = (event: any) => {
      audio.pause();
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      audio.pause();
      audio.currentTime = 0;

      if (transcript.trim()) {
        resolve(transcript.trim());
      } else {
        reject(new Error('No speech was recognized. Please make sure audio is playing through your speakers or microphone.'));
      }
    };

    recognition.start();

    // Play audio after recognition starts
    audio.currentTime = startTime;
    audio.play().catch(() => {
      // Audio playback may fail if blocked by browser
      console.warn('Audio playback failed - make sure to have audio playing through your speakers');
    });

    // Stop recognition after the segment ends
    const duration = endTime - startTime;
    const timeoutDuration = Math.max(duration * 1000 + 500, 3000);

    setTimeout(() => {
      recognition.stop();
    }, timeoutDuration);
  });
}

export function startSpeechRecognition(setAnswer) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported. Please use Google Chrome.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("Listening...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setAnswer(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);

    if (event.error === "network") {
      alert("Speech recognition network error. Check internet or try Chrome.");
    } else if (event.error === "not-allowed") {
      alert("Microphone permission denied. Allow mic access in browser.");
    } else {
      alert("Speech recognition failed. Please type your answer.");
    }
  };

  recognition.start();
}
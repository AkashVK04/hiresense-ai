let mediaRecorder;
let audioChunks = [];

export async function startRecording() {
  audioChunks = [];

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.start();
}

export function stopRecording() {
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, {
        type: "audio/webm",
      });

      resolve(audioBlob);
    };

    mediaRecorder.stop();
  });
}
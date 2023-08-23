import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import httpx from 'httpx';

const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const whisperEndpoint = "http://31.28.93.84";



const engine = {
    onmessage: function(e) {
        switch (e.data.command) {
            case 'process':
                const inputData = e.data.inputFrame;
                handleAudioData(inputData);
                break;
        }
    }
};

const handleAudioData = async (inputData) => {
    // Send audio data to Whisper API for transcription
    const response = await httpx.post(`${whisperEndpoint}/transcribe`, {
        json: {
            input_features: inputData,
            data_pre_processing: true,
            data_post_processing: true,
            callback_url: 'https://webhook.site/dd542931-61ca-42aa-8584-6e11bfbcc0fa',
        },
    });

    // Display the transcribed text
    const transcription = response.json().transcription;
    document.getElementById('transcription-output').innerText = transcription;
};




startButton.addEventListener('click', async () => {
    // Once WebVoiceProcessor has at least one engine subscribed, audio capture begins
    WebVoiceProcessor.subscribe(engine);
});

stopButton.addEventListener('click', () => {
    // Once WebVoiceProcessor no longer has engines subscribed, audio capture stops
    WebVoiceProcessor.unsubscribe(engine);
});
                       
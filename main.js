import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import { write } from 'fs';
import httpx from 'httpx';

const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const voiceProcessor = new WebVoiceProcessor();
const whisperEndpoint = "http://31.28.93.84";

let isRecording = false;

// Function to load audio file and return it as an array
const loadFile = async (inputPath) => {
    const response = await fetch(inputPath);
    const audioData = await response.arrayBuffer();
    return new Float32Array(audioData);
};

// Function to send GET request to get the result
const getResult = async (id) => {
    const response = await httpx.get(`${whisperEndpoint}/result/${id}`);
    return JSON.parse(response.body.toString());
};

// Function to send POST request to transcribe the audio
const transcribe = async (input) => {
    const response = await httpx.post(`${whisperEndpoint}/transcribe`, {
        json: input
    });
    return JSON.parse(response.body.toString());
};

// Function to start recording
const startRecording = () => {
    if (!isRecording) {
        voiceProcessor.start();
        isRecording = true;
    }
};

const engine = {
    onmessage: async function (e) {
        switch (e.data.command) {
            case 'process':
                const inputData = e.data.inputFrame;
                
                // Convert Float32Array to regular array
                const inputFeatures = Array.from(inputData);
                
                // Prepare the input for transcription
                const transcriptionInput = {
                    input_features: inputFeatures,
                    data_pre_processing: true,
                    data_post_processing: true,
                    callback_url: 'https://webhook.site/dd542931-61ca-42aa-8584-6e11bfbcc0fa',
                };

                // Perform the transcription
                const transcribeRequest = await transcribe(transcriptionInput);
                console.log(transcribeRequest);

                const taskId = transcribeRequest.task_id;
                console.log(taskId);

                // Get the result
                const result = await getResult(taskId);
                console.log(result);

                // Handle the result as needed
                // For example, you can display the transcribed text in the 'transcription-output' div:
                const transcriptionOutput = document.getElementById('transcription-output');
                transcriptionOutput.innerText = result.transcription;

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
    const transcription = response.json()?.transcription;
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
                       
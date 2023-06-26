# OpenAI Transcription Service
A simple node.js application that transcribes audio files using OpenAI's transcription service.


## Features
- Uses OpenAI's API for transcription
- Handles large audio files by splitting them into sections (whisper is limited to `26000000~` bytes)
- Provides transcription progress updates
- Outputs transcriptions as a single text file

## Prerequisites
- Node.js installed on your machine
- An OpenAI account with an API key

## Installation
1. Clone this repository: git clone <repository-url>.
2. Install necessary dependencies: `yarn install`.
3. Create a `.env` file at the root directory and add your OpenAI API key:

```makefile
OPENAI_API_KEY=<your_openai_api_key>
```

## Usage
This script transcribes an audio file into text.

To use, simply run the script with the file path to the audio file as the first argument:

```bash

node index.js /path/to/your/audio/file.mp3
```
Here, `index.js` is the name of your Node.js script and `/path/to/your/audio/file.mp3` is the path to the audio file you want to transcribe. You'll need to replace these with the actual names and paths of your script and audio file.

The script will output the transcription to the console.
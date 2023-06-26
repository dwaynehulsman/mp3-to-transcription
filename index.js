require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const path = require('path');
const MediaSplit = require('media-split');
const { spawn } = require('child_process');
const ffprobePath = require('ffprobe-static').path;


async function getAudioDurationInSeconds(filePath) {
  return new Promise((resolve, reject) => {
    const process = spawn(ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=nw=1:nk=1',
      filePath
    ]);

    process.stdout.on('data', (data) => {
      resolve(Math.floor(parseFloat(data)));
    });

    process.stderr.on('data', (data) => {
      reject(`Error getting audio duration: ${data}`);
    });
  });
}

async function transcribe(file) {
  const response = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    {
    file,
    model: 'whisper-1',
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  return response.data.text;
}

async function main() {
  // Process the command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0) {
    throw new Error('You must provide a file path as the first argument.');
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist at path: ${filePath}`);
  }

  let duration = await getAudioDurationInSeconds(filePath);
  let sections = [];
  for (let i = 0; i < duration; i += 300) { // 300 seconds is 5 minutes
    let start = i;
    let end = Math.min(i + 300, duration);
    sections.push(`[${formatTime(start)} - ${formatTime(end)}] Part${i / 300 + 1}`);
  }

  let split = new MediaSplit({ input: filePath, sections });
  let sectionsData = await split.parse();
  
  console.log(`Split MP3 into ${sectionsData.length} sections.`)

  let allTranscriptions = "";
  for (let i = 0; i < sectionsData.length; i++) {
    let section = sectionsData[i];
    console.log(`Transcribing ${section.name} (${i+1}/${sectionsData.length})`);
    let file = fs.createReadStream(`./${section.name}`);
    let transcript = await transcribe(file);
    allTranscriptions += transcript + "\n";
  }

  await saveTranscription(allTranscriptions, sectionsData.length);
}

function formatTime(timeInSeconds) {
  let hours = Math.floor(timeInSeconds / 3600);
  let minutes = Math.floor((timeInSeconds - (hours * 3600)) / 60);
  let seconds = timeInSeconds - (hours * 3600) - (minutes * 60);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function saveTranscription(transcript, sectionCount, name = '') {
  // Write to a file
  const date = new Date();
  const outputFileName = `transcription_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${name}.txt`;
  const outputDir = path.join(__dirname, 'transcriptions');

  // Create directory if it does not exist
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }

  fs.writeFile(path.join(outputDir, outputFileName), transcript, (err) => {
    if (err) throw err;
    console.log(`The transcription of ${sectionCount} sections was saved to ${outputFileName}`);
  });
}

main().catch(error => {
  console.error(error);
});

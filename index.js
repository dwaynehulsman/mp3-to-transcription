require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const path = require('path');

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

  const file = fs.createReadStream(filePath);
  const transcript = await transcribe(file);

  console.log(transcript);

  // Write to a file
  const date = new Date();
  const outputFileName = `transcription_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.txt`;
  const outputDir = path.join(__dirname, 'transcriptions');

  // Create directory if it does not exist
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }

  fs.writeFile(path.join(outputDir, outputFileName), transcript, (err) => {
    if (err) throw err;
    console.log(`The transcription was saved to ${outputFileName}`);
  });
}


main().catch(error => {
  console.error(error);
});

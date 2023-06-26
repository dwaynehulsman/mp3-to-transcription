require('dotenv').config();

const fs = require('fs');
const axios = require('axios');

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
}

main().catch(error => {
  console.error(error);
});

import { App, ReceiverEvent } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import * as dotenv from 'dotenv';
import express from 'express';

// Load environment variables from .env file
dotenv.config();

// Set Slack API credentials
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN as string;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET as string;
const SLACK_BOT_USER_ID = process.env.SLACK_BOT_USER_ID as string;

// Initialize the Slack app
const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
});

(async () => {
    await app.start();
    console.log('⚡️ Bolt app is running!');
  })();  

// Initialize the Express app
const expressApp = express();

// Initialize the Slack client
const slackClient = new WebClient(SLACK_BOT_TOKEN);

async function getBotUserId(): Promise<string | undefined> {
  try {
    const response = await slackClient.auth.test();
    console.log(response.user_id);
    return response.user_id as string;
  } catch (error) {
    console.error(`Error: ${error}`);
    return undefined;
  }
}

app.event('app_mention', async ({ event, say }) => {
  // Event listener for mentions in Slack
  const text = event.text;

  const mention = `<@${SLACK_BOT_USER_ID}>`;
  const processedText = text.replace(mention, '').trim();

  say('Sure, I\'ll get right on that!');

  // TODO: Not processing the AI response for now.
//   const response = myFunction(processedText);
//   say(response);
});

// Define a route for handling Slack events
expressApp.use('/slack/events', express.json());

expressApp.post('/slack/events', (req, res) => {
  const data = req.body;
  console.log(data.event.text)
  // Check if the request is a challenge request
  if ('challenge' in data) {
    res.json({ challenge: data.challenge });
  }

  const event: ReceiverEvent = {
    body: data,
    ack: async (response) => {
      if (response instanceof Error) {
        res.status(500).send();
      } else {
        // Introduce some handling here!
        res.sendStatus(200)
      }
    }
  };

  // Use the app.process method to dispatch events to the appropriate handlers
  (async () => {
    await app.processEvent(event);
  })();

});

// Run the Express app
expressApp.listen(3535, () => {
  console.log('The app is running on port 3535');
});
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');
const dot_env = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const accountSid = 'AC07a8f23cbe8a35a85c5fd9550cdd1e79';
const authToken =  '81c841c3c256db0bfa740bac269ed8d0';
const twilioPhoneNumber = '+16176065334';
const userPhoneNumber = '+251973073279';
// AC07a8f23cbe8a35a85c5fd9550cdd1e79
// 81c841c3c256db0bfa740bac269ed8d0
//+16176065334

const client = twilio(accountSid, authToken);
let isSMSSentLow = false;
let isSMSSentHigh = false;
// let isLEDTurnedOn = false;

app.post('/soil-moisture', (req, res) => {
  const moisture = req.body.moisture;

  if (moisture < 10 && !isSMSSentLow) {
    sendSMS('Critical alert! Soil moisture is under 10%. Turn on the pump!');
    isSMSSentLow = true;
    isSMSSentHigh = false;

  } else if (moisture > 23 && !isSMSSentHigh) {
    sendSMS('Soil moisture is above 60%. Turn off the pump.');
    isSMSSentHigh = true;
    isSMSSentLow = false;
  }

  res.sendStatus(200);
});



app.post('/led-state', (req, res) => {
    const ledState = req.body.ledState;
  
    if (ledState === true && !isLEDTurnedOn) {
      // LED is turned on
      sendSMS('LED light is now ON.');
      isLEDTurnedOn = true;
    } else if (ledState === false && isLEDTurnedOn) {
      // LED is turned off
      sendSMS('LED light is now OFF.');
      isLEDTurnedOn = false;
    }
  
    res.sendStatus(200);
  });

function sendSMS(message) {
  client.messages.create({
    to: userPhoneNumber,
    from: twilioPhoneNumber,
    body: message
  })
  .then((message) => {
    console.log('Twilio response:', message.sid);
  })
  .catch((error) => console.error('Error sending SMS:', error.message));
}

app.listen(port, () => {
    console.log(`Server is running on http://172.20.10.9:${port}`);
});

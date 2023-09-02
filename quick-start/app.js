/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `yarn install`
 * 3. Add your VERIFY_TOKEN and PAGE_ACCESS_TOKEN to your environment vars
 */

"use strict"

// Use dotenv to read .env vars into Node
require("dotenv").config()

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  { urlencoded, json } = require("body-parser"),
  app = express()

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }))

// Parse application/json
app.use(json())

// Respond with 'Hello World' when a GET request is made to the homepage
app.get("/", function (_req, res) {
  res.send("Hello World")
})

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN

  // Parse the query params
  let mode = req.query["hub.mode"]
  let token = req.query["hub.verify_token"]
  let challenge = req.query["hub.challenge"]

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED")
      res.status(200).send(challenge)
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403)
    }
  }
})

// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
  let body = req.body

  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0]
      console.log(webhookEvent)

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id
      console.log("Sender PSID: " + senderPsid)

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message)
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback)
      }
    })

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED")
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404)
  }
})

// Handles messages events
function handleMessage(senderPsid, receivedMessage) {
  let response
if (receivedMessage.text === "بكام") {
    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Welcome to one for all store",
              subtitle: "What do you want to know ?",
              buttons: [
                {
                  type: "postback",
                  title: "الاسعار",
                  payload: "T1",
                },
                {
                  type: "postback",
                  title: "العناويين",
                  payload: "T2",
                },
              ],
            },
          ],
        },
      },
    }
  }

  // Send the response message
  callSendAPI(senderPsid, response)
}

// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
  let response

  // Get the payload for the postback
  let payload = receivedPostback.payload

  // Set the response based on the postback payload
  if (payload === "T1") {
    response = {
      text: `الاسعار 
خامة قطن ١٠٠٪؜ 
تيشيرت طباعة وش  300 ج
طباعة وش وظهر 350 ج
الاوفر سايز بيزيد 50 ج
 

التوصيل خلال ٤ ايام من طلب الاوردر و يرجي ارسال العنوان ورقم التليفون والوزن والطول لطلب الاوردر  

الشحن لاي محافظة ب 50 ج

للطلب في اسرع وقت برجاء االتاكيد من الموقع الرسمي 
one14all.com

وشكرا لكل عملاءنا ودايما عند ثقتكم فينا ❤❤`,
    }
  } else if (payload === "T2") {
    response = {
      text: `فرع الهرم اول شارع ضياء مزار مول (كارفور مول) الدور التاني 🔸
https://goo.gl/maps/c7iiYQtxVBQUXMUu6


فرع العمرانية شارع سيدي عمار قريب من مترو ساقية مكي الخط ال2🔸
https://goo.gl/maps/bhaxGFhqzsMBYqcLA


فرع اسكندرية 🎉🎉 والخصومات الحصرية
🔸 شارع الدهان متفرع من شارع بور سعيد كامب شيزار بجانب محطة كامب شيزار الترام وقهوة والي 
https://goo.gl/maps/AhCDniHxvqVFMvMA9 `,
    }
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response)
}

// Sends response messages via the Send API
function callSendAPI(senderPsid, response) {
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

  // Construct the message body
  let requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  }

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err, _res, _body) => {
      if (!err) {
        console.log("Message sent!")
      } else {
        console.error("Unable to send message:" + err)
      }
    }
  )
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port)
})

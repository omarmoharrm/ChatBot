import "dotenv/config"
import request from "request"
export const test = (req, res) => {
  return res.send("hello again!")
}
export const getWebhook = (req, res) => {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN
  // Parse the query params
  let mode = req.query["hub.mode"]
  let token = req.query["hub.verify_token"]
  let challenge = req.query["hub.challenge"]

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED")
      res.status(200).send(challenge)
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403)
    }
  }
}

export const postWebhook = (req, res) => {
  // Parse the request body from the POST
  let body = req.body

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0]
      console.log(webhook_event)

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id
      console.log("Sender PSID: " + sender_psid)

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message)
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback)
      }
    })

    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED")
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404)
  }
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response

  // Check if the message contains text
  if (received_message.text == "بكام" || "الاسعار" || "السعر" || "hm") {
    // Create the payload for a basic text message
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
  } else if (
    received_message.text == "العنوان" ||
    "العناويين" ||
    "المكان" ||
    "مكانكم"
  ) {
    response = {
      text: `فرع الهرم اول شارع ضياء مزار مول (كارفور مول) الدور التاني 🔸
https://goo.gl/maps/c7iiYQtxVBQUXMUu6


فرع العمرانية شارع سيدي عمار قريب من مترو ساقية مكي الخط ال2🔸
https://goo.gl/maps/bhaxGFhqzsMBYqcLA


فرع اسكندرية 🎉🎉 والخصومات الحصرية
🔸 شارع الدهان متفرع من شارع بور سعيد كامب شيزار بجانب محطة كامب شيزار الترام وقهوة والي 
https://goo.gl/maps/AhCDniHxvqVFMvMA9 `,
    }
  } else if (received_message.attachments) {
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this the right picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachment_url,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes",
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no",
                },
              ],
            },
          ],
        },
      },
    }
  }

  // Sends the response message
  callSendAPI(sender_psid, response)
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response

  // Get the payload for the postback
  let payload = received_postback.payload

  // Set the response based on the postback payload
  if (payload === "yes") {
    response = { text: "Thanks!" }
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response)
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  }

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v7.0/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!")
      } else {
        console.error("Unable to send message:" + err)
      }
    }
  )
}

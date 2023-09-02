import request from "request"
module.exports = function senderAction(recipientId) {
  request(
    {
      url: "https://graph.facebook.com/v7.0/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: {
        recipient: { id: recipientId },
        sender_action: "typing_on",
      },
    },
    function (err, response, body) {
      if (err) {
        console.log("Error sending message: " + response.err)
      }
    }
  )
}

import request from "request"
module.exports = function sendMessage(recipientId, message) {
  return new Promise(function (resolve, reject) {
    request(
      {
        url: "https://graph.facebook.com/v7.0/me/messages",
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: {
          recipient: { id: recipientId },
          message: message,
        },
      },
      function (err, response, body) {
        if (err) {
          console.log("Error sending message: " + response.err)
          reject(response.error)
        } else {
          resolve(body)
        }
      }
    )
  })
}

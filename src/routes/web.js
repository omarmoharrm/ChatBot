import express from "express"
import {
  test,
  getWebhook,
  postWebhook,
} from "../controller/chatbotController.js"
let router = express.Router()
let initWebRoutes = (app) => {
  router.get("/", test)
  router.get("/webhook", getWebhook)
  router.post("/webhook", postWebhook)
  return app.use("/", router)
}
export default initWebRoutes

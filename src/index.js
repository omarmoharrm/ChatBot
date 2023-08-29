import express from "express"
import bodyParser from "body-parser"
import viewEngine from "./config/viewEngine.js"
import initWebRoutes from "./routes/web.js"

let app = express()
viewEngine(app)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

initWebRoutes(app)
let port = process.env.port || 8080
app.listen(port, () => {
  console.log("app listening on port: " + port)
})

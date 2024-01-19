import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import router

import userRouter from "./routes/user.route.js"
import subscriptionRouter from "./routes/subscription.route.js"


// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/subscription", subscriptionRouter)


export default app
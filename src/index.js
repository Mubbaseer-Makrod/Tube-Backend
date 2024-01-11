import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"

dotenv.config({
    path: "./.env"
})

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error :", error);
        throw error
    })
    app.listen(process.env.PORT || 8000 ,() => {
        console.log(`Application is listening at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGODB connection failed : ", err);
})

/*
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}\${DB_NAME}`);
        app.on("error", () => {
            console.log("ERROR :", error)
            throw error
        });
        
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on ${process.env.PORT}`);
        })
     } catch (error) {
         console.log("ERROR:", error)
     }
})()
*/
import express from "express";
import bodyParser from "body-parser";
import { SignUp } from "./routes/Sign-Up.js";
import { Kidtergarten } from "./routes/Kidtergarten.js";

const app = express();
const port = 3800;

app.use("/public", express.static("public"));
app.set("view engine", "ejs");
app.set('trust proxy', 1)
app.use(bodyParser.urlencoded({extended: true}))

app.get("/", (req, res) => {
    res.render('layouts/userLayouts/userFrontGame')
   // res.render("http://localhost:3000/Login") //
})


app.use("/Sign-Up", SignUp)
app.use("/Kidtergarten", Kidtergarten)




app.listen(port, () => {
    console.log("app started")
})
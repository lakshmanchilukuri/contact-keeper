const express = require("express");
var bodyParser = require("body-parser");
const connectDB = require("./config/db");

connectDB(); //connect to mongo DB using mongURI from config

const app = express();

// app.use(express.bodyParser()); // removed from express 4.x
// app.use(app.router);

const port = 5000;
app.listen(port, () => console.log("server started at " + port));

//route the URI to sepecified routes
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => res.json({ msg: "in end point" }));

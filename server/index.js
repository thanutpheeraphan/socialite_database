require('dotenv').config()
const express = require("express");
const app = express()
const cors = require("cors");

//middleware

app.use(express.json()) //req.body
app.use(cors())

//ROUTES

//register and login route {user}

app.use("/auth",require("./routes/jwAuth"));

//dashboard route

app.use("/dashboard", require("./routes/dashboard"));

//rooms route

app.use("/rooms", require("./routes/rooms"));

// app.get("*", (req,res)=>{
// 	res.sendFile(path.join(__dirname,""))
// })

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});



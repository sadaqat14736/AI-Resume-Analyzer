const express = require("express");
const dbCon = require("./db/dbConnection");
const userData = require("./router/route");


const app = express();
const PORT = 3000 || process.env.PORT;

dbCon();
app.use(express.json());

app.use("/api", userData);
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});

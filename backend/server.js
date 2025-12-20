const express = require("express");
const dbCon = require("./db/dbConnection");
const userData = require("./router/route");
const resumeRoutes = require("./router/routeResume");
const jobRoutes = require("./router/routeJob")


const app = express();
const PORT = 3000 || process.env.PORT;

dbCon();
app.use(express.json());


// Use the Auth routes
app.use("/api", userData);
// Use the Resume routes
app.use("/api", resumeRoutes);
// Use the job routes
app.use("/api", jobRoutes);




app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});

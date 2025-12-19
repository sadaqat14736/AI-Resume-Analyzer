const express = require("express");
const { register, login } = require("../controller/auth");
const authrization = require("../middleware/authentication")



const router = express.Router();

router.post("/createUser", register);
router.post("/login", login);
router.get("/home", authrization, (req, res) => {
     res.send({
         status: 200,
         message: "Welcome! You are authorized",
          user: req.user
    });     
})




module.exports = router;
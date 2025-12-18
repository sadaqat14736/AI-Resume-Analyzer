const bcrypt = require("bcryptjs");
const users = require("./../db/userSchema");
const jwt = require("jsonwebtoken");


const dotenv = require("dotenv");
const saltRounds = 10;

async function register(req, res){
    try{
        const { name, email, password, confirmPassword } = req.body;

        if(password !== confirmPassword){
            return res.status(400).send({
                message: "Password and confirm password do not match",
                status: 400
            });    
        };

        const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/;
        if(!strongPassword.test(password)){
            return res.send({
                status: 400,
                message: "Password must contain at least one letter, one number, and one special character"
            });
        };

        bcrypt.genSalt(saltRounds, function (err, salt){
            bcrypt.hash(password, salt, function (err, hash){
                const user = {
                    name,
                    email, 
                    password: hash,
                };

                const result = new users(user).save();
                res.send({
                    message: "signup successfully",
                    user,
                    status:200,
                });
            });
        });

    }
    catch(err){
        res.send({
            err,
            status: 500,
            message: "sorry! server is not responding",
        });
    }
}


async function login(req, res){
    try{
        const { email, password } = req.body;

        if(!email || !password ){
            return res.status(400).json({
                status: 401,
                message: "Email or Password is missing"
            });
        };

        const dbUser = await  users.findOne({ email });
        console.log(dbUser, "here is a user");

         if (!dbUser){
            return res.status(401).json({
                status: 401,
                message: "User not found"
            });
         };


        const isPasswordValid = await bcrypt.compare(password, dbUser.password);
        if (!isPasswordValid){
            return res.status(401).json({
                status: 401,
                message: "Invalid password"
            });
        };


         const token = jwt.sign(
            {
                id: dbUser._id,
                email: dbUser.email,
                role: dbUser.role
            },
            process.env.JWTSECRETKEY,
            { expiresIn: "1d" }
         );

         console.log(token);

         res.cookie("jwtToken", token,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
         });

         return res.status(200).json({
            status: 200,
            message: "Login successful",
            token,
            dbUser
         });
    }
    catch(err){
         return res.status(500).json({
            status: 500,
            message: "Server not responding",
            err
         });
    };
};




module.exports = { register, login };
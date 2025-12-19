const jwt = require("jsonwebtoken");
require("dotenv").config();


const authrization = (req, res, next) => {
    try{
        const header = req.headers.authorization;
        console.log("Authorization Header:", header);

        if(!header){
            return res.status(401).send({
                status: 401,
                message: "Authorization header missing"
            });
        };

        const token = header.split(" ")[1];
        if(!token){
            return res.status(401).send({
                status: 401,
                message: "Token missing"
            });
        };


        const decoded = jwt.verify(token, process.env.JWTSECRETKEY);
        req.user = decoded; 

        next();

    }
    catch(err){
        return res.status(403).send({
            status: 403,
            message: "Invalid or expired token"
        });
    };
};




module.exports = authrization;
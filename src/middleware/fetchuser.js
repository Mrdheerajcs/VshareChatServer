var jwt = require('jsonwebtoken');
const JWT_SECRET  = "SocialMediaApi";

const fetchuser = (req,res, next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({message: 'Invalid token'});
    }
    try{
        const data  = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        // console.log(data)
        next();
    }catch(e){
       res.status(401).send({message: 'Invalid token error'});
    }
}

module.exports = fetchuser;
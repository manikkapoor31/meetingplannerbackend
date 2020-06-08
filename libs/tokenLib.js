const jwt=require('jsonwebtoken')
const shortid=require('shortid')
const secretkey='someveryRandomKeyThatNobodyCanGuess'

let generateToken=(data,cb)=>{
    try{
        let claims={
            jwtid:shortid.generate(),
            iat:Date.now(),
            exp:Math.floor(Date.now()/1000)+(60*60*24),
            sub:'authToken',
            iss:'edChat',
            data:data
        }
        let tokenDetails={
            token:jwt.sign(claims,secretkey),
            tokenSecret:secretkey
        }
        cb(null,tokenDetails)
    }
    catch(err){
        console.log(err)
        cb(err,null)

    }
    
}
let verifyClaim=(token,cb)=>{
    jwt.verify(token,secretkey,function(err,decoded){
        if(err){
            console.log("errror while hecking token")
            console.log(err)
            cb(err,null)
        }
        else{
            console.log("user verified")
            console.log(decoded);
            cb(null,decoded)
        }

    })
}
module.exports={
    generateToken:generateToken,
    verifyToken:verifyClaim
}
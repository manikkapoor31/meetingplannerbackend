const mongoose=require('mongoose')
const express=require('express')
const shortid=require('shortid')
const logger =require('./../libs/loggerLib')
const response=require('./../libs/responseLib')
const time=require('./../libs/timeLib')
const validateInput= require('./../libs/paramsValidationLib')
const check =require('./../libs/checkLib')
const token=require('./../libs/tokenLib')
const passwordLib=require('./../libs/generatePasswordLib')
/* Models */
const authModel=mongoose.model('auth')

/*Models */
const UserModel=mongoose.model('User')

//DELETE USER FUNCTION
let deleteUser=(req,res)=>{
    UserModel.findOneAndRemove({'userId':req.param.userId}).exec((err,result)=>{
        if(err){
            console.log(err)
            logger.error(err.message,'User Controller: deleteUser',10)
            let apiResponse=response.generate(true,'Failed to delete user',500,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            logger.info('No user found','User Controller: deleteUser')
            let apiResponse=response.generata(true,'No User Found',404,null)
            res.send(apiResponse)
        }
        else{
            let apiResponse=response.generate(false,'Deleted the user successfully',200,null)
            res.send(apiResponse)            
        }
    });
}

//EDIT USER FUNCTION
let editUser=(req,res)=>{
    let options=req.body;
    UserModel.update({'userId':req.params.userId},options).exec((err,result)=>{
        if(err){
            console.log(err)
            logger.error(err.message,'User Controller: editUser',10)
            let apiResponse=response.generate(true,'Failed to edit user details',500,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            logger.info('No User Found','Userer Controller: Edit User')
            let apiResponse=response.generate(false,'No User FOund',404,null)
            res.send(apiResponse)
        }
        else{
            let apiResponse=response.generate(false,'User Details Edited',200,result)
            res.send(apiResponses)
        }
    })
}

// start user signup function
let signupFunction=(req,res)=>{
    let validateUserInput=()=>{
        return new Promise((resolve,reject)=>{
            if (req.body.email){
                if(!validateInput.Email(req.body.email)){
                    let apiResponse=response.generate(true,'Email Doesn\'s meet the requirement',400,null)
                    reject(apiResponse)
                }
                else if(check.isEmpty(req.body.password)){
                    let apiResponse=response.generate(true,"password param is missing",400,null)
                    reject(apiResponse)

                }
                else{
                    resolve(req)
                }
            }
            else{
                logger.error('Field Missing During User Creation','userController:createUser()',5)
                let apiResponse=response.generate(true,"One or more param is missing",400,null)
                reject(apiResponse)
            }
        })
    }
    let createUser=()=>{
        return new Promise((resolve,reject)=>{
                UserModel.findOne({email:req.body.email}).exec((err,retrievedUserDetails)=>{
                    if(err){
                        logger.error(err.message,'userController:createUser',10)
                        let apiResponse=response.generate(true,'Failed to create user',500,null)
                        reject(apiResponse)
                    }
                    else if(check.isEmpty(retrievedUserDetails)){
                        console.log(req.body)
                        let newUser=new UserModel({
                            userId:shortid.generate(),
                            firstName:req.body.firstName,
                            lastName:req.body.lastName||'',
                            email:req.body.email.toLowerCase(),
                            countryCode:req.body.countryCode,
                            mobileNumber:req.body.mobileNumber,
                            password:passwordLib.hashpassword(req.body.password),
                            created:time.now()
                        })
                        newUser.save((err,newUser)=>{
                            if(err){
                                console.log(err)
                                logger.error(err.message,'userController:createUser',10)
                                let apiResponse=response.generate(true,'Failed to create new user',500,null)
                                reject(apiResponse)
                            }
                            else{
                                let newUserObj=newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                    }
                    else{
                        logger.error('user cannot be created. User already present','usercontroller:createuser',4)
                        let apiResponse=response.generate(true,'user Already Present',403,null)
                        reject(apiResponse)
                    }
                })

            })
    }
    validateUserInput(req,res).then(createUser).then((resolve)=>{
        delete resolve.password
        let apiResponse=response.generate(false,'user created',200,null)
        res.send(apiResponse)
    })

}

let loginFunction=(req,res)=>{
    console.log('login called')
    let findUser=()=>
    {
        console.log('finding user')
        return new Promise((resolve,reject)=>
        {
            if(req.body.email){
                console.log("req body email is there");
                console.log(req.body)
                UserModel.findOne({email:req.body.email},(err,userDetails)=>
                {
                    if(err)
                    {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data','userController:findUser()',10)
                        let apiResponse=response.generate(true,'Failed to Find User Details',500,null)
                        reject(apiResponse)
                    }
                    else if(check.isEmpty(userDetails))
                    {
                        logger.error('No user found','usercontroller',findUser(),7)
                        let apiResponse=response.generate(true,'No user details found',404,null)
                        reject(apiResponse)
                    }
                    else
                    {
                        logger.info('User Found','userController:findUser()',10)
                        console.log(userDetails)
                        resolve(userDetails)
                    }
                })
            }
            else{
                let apiResponse=response.generate(true,'email','parameter is missing',400,null)
                reject(apiResponse)

            }
      })

    }
    let validatePassword=(retrievedUserDetails)=>
    {
        console.log('Validate Password')
        console.log(retrievedUserDetails.password)
        console.log(req.body.password)
        return new Promise((resolve,reject)=>
        {
            passwordLib.comparePassword(req.body.password,retrievedUserDetails.password,(err,isMatch)=>
            {
                if(err)
                {
                    console.log(err)
                    logger.error(err.message,'userController:validatePassword()',10)
                    let apiResponse=response.generate(true,'Login Failed',500,null)
                    reject(apiResponse)
                }
                else if(isMatch)
                {
                    let retrievedUserDetailsObj=retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                }
                else
                {
                    logger.info('Login Failed Due to Invalid Password','userController:validatePassword()',10)
                    let apiResponse=response.generate(true,'Wrong Password.login Failed',400,null)
                    reject(apiResponse)
                }
    
            })
        })
    }
    let generateToken=(userDetails)=>
    {
        console.log('generate token')
        return new Promise((resolve,reject)=>
        {
            token.generateToken(userDetails,(err,tokenDetails)=>
            {
                if(err)
                {
                    console.log(err)
                    let apiResponse=response.generate(true,'Failed to Generate Token',500,null)
                    reject(apiResponse)
                }
                else{
                    tokenDetails.userId=userDetails.userId
                    tokenDetails.userDetails=userDetails
                    resolve(tokenDetails)
                }
            }).catch((err)=>{
                console.log('errorhandler')
                console.log(err)
                res.status(err.status)
                res.send(err)
            })
        })
    }
    let saveToken=(tokenDetails)=>
    {
        console.log("save token")
        return new Promise((resolve,reject)=>{
            console.log("inside token")
            authModel.findOne({userId:tokenDetails.userId},(err,retrievedTokenDetails)=>
            {
                console.log("inside 1")
                if(err)
                {   
                    console.log(err.message,'userController:saveToken',10)
                    let apiResponse=response.generate(true,'Failed to generate Token',500,null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(retrievedTokenDetails))
                {
                    let newauthToken=new authModel({
                        userId:tokenDetails.userId,
                        authToken:tokenDetails.token,
                        tokenSecret:tokenDetails.tokenSecret,
                        tokenGenerationTime:time.now()
                    })
                    newauthToken.save((err,newTokenDetails)=>{
                        if (err){
                            console.log(err)
                            logger.error(err.message,'User Controller:saveToken',10)
                            let apiResponse=response.generate(true,'Failed to Generate Token',500,null)
                            reject(apiResponse)
                        }
                        else{
                            let responseBody={
                                authToken: newTokenDetails.authToken,
                                userDetails:tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
                else
                {
                    retrievedTokenDetails.authToken=tokenDetails.token;
                    retrievedTokenDetails.tokenSecret=tokenDetails.tokenSecret;
                    retrievedTokenDetails.tokenGenerationTime=tokenDetails.tokenGenerationTime;
                    retrievedTokenDetails.save((err,newTokenDetails)=>
                    {
                        if(err)
                        {
                            console.log(err);
                            logger.error(err.message,'userController:saveToken',10);
                            let apiResponse=response.generate(true,'Failed to  Generate Token',500,null);
                            reject(apiResponse)
                        }
                        else
                        {
                            let responseBody={
                                authToken: newTokenDetails.authToken,
                                userDetails:tokenDetails.userDetail
                            }
                            resolve(responseBody)
                        }
                        
                    })
                }
            })
        })
    
    }
    findUser().then(validatePassword).then(generateToken).then(saveToken).then((resolve)=>
        {
            let apiResponse=response.generate(false,'login successful',200,resolve)
            res.send(200)
            res.send(apiResponse)
        })
        .catch((err)=>{
            console.log(err)
            res.status(err.status)
            res.send(err)
        }) 

}
//function to logout user
//auth params:userId
let logout=(req,res)=>{
    authModel=findOneAndRemove({userId:req.user.userId},(err,resul)=>{
        if (err){
            console.log(err)
            logger.error(err.message,'user Controller : logout',10)
            let apiResponse=response.generate(true,`error occured: ${err.message}`,500,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            let apiResponse=response.generate(true,'Already logged out or Invalid userId',404,null)
            res.send(apiResponse)
        }
        else{
            let apiResponse=response.generate('false','Logged out successfully',200,null)
            res.send(apiResponse)
        }
    })
}
module.exports={
    signupFunction: signupFunction,
    editUser: editUser,
    deleteUser: deleteUser,
    loginFunction: loginFunction,
    logout: logout
}
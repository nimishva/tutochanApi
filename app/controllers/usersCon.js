const mongoose       = require('mongoose');//Including Express
const apiResponse    = require('../libs/responseGenLib'); // Response generation library
const checkLib       = require('../libs/checkLib'); // Data validation library
const shortId        = require('shortid'); //unique id generator
const passwordLib    = require('../libs/passwordLib') // Password handling library . hashpassword ,compare password etc..
const tokenLib       = require('../libs/tokenLib'); //Token Library
const logger         = require('../libs/logger') //Logging library
const timeLib        = require('../libs/timeLib') //Date and time handling library
const mailLib        = require('../libs/sendMailLib'); //Mail Library 
const events         = require('events') //Evemt Emitter

const emitter = new events();

const userModal = mongoose.model('Users'); //Importing Models
const authModel = mongoose.model('Auth'); //Importing Models

//User signup Function Starts here
let signUpFn = (req,res) => {
    // promise functions starts
    checkEmailAvailability(req,res)
    .then((resolve) =>{
        
        delete resolve.password;
        delete resolve._id;
        delete resolve.__v;
        emitter.emit('mail',resolve);
        let apiresponse = apiResponse.generate(false,'User created',200,resolve);
        res.send(apiresponse);

    })
    .catch(err => {
        console.log(err);
        res.send(err);
    })

} //User signup Function ends here


//Login function 

let signInFn = (req,res) => {
    console.log(req.body.email);
    let validateUser = () => {
        return new Promise((resolve,reject)=>{
            userModal.findOne({'email.emailId':req.body.email})
            .exec((err,retrievedUserData)=>{
                if(err){
                    let apiResponse = apiResponse.generate(true,'User data cant be fetched from DB',403,null);
                    reject(apiResponse);
                }else if(checkLib.isEmpty(retrievedUserData)){
                    let response = apiResponse.generate(true,'User details not found',403,null);
                    reject(response);
                }else{
                    resolve(retrievedUserData);
                }
            });
        }) //Promise ends 


    } //ValidateUser Fn ends

    let validatePassword = (retrievedUserData)=>{
        return new Promise((resolve,reject)=>{
            if(!checkLib.isEmpty(req.body.password)){

                passwordLib.comparePassword(req.body.password,retrievedUserData.password,(err,isMatching)=>{
                    if(err){
                        let apiResponse = apiResponse.generate(true,'Login failed',500,null);
                        reject(apiResponse);
                    }else if(isMatching){
                        let userDataObj = retrievedUserData.toObject();
                        delete userDataObj.password
                        delete userDataObj._id
                        delete userDataObj.__v
                        delete userDataObj.createdOn
                        resolve(userDataObj);
                    }else{
                    //    console.log(retrievedUserData);
                        let response = apiResponse.generate(true,'Wrong password',400,null);
                        reject(response);
                    }
                })// Password check ends here 
                
            }else{

                resolve(retrievedUserData);

            }
       

        }) //Prominse ends
    } //validatePassword ends

    let generateToken = (userData)=>{
        return new Promise((resolve,reject)=>{
            tokenLib.generate(userData,(err,tokenData)=>{
              if(err){
                let apiResponse = apiResponse.generate(true,'Token Generation failed',500,null);
                reject(apiResponse);
              }else{
                tokenData.userId    = userData.userId;
                tokenData.userData  = userData;
                resolve(tokenData);
              }            
            })//Token Generation ends here 
        })
    } //Generate Token ends here


    let saveToken = (tokenData) =>{
        return new Promise((resolve,reject)=>{
            authModel.findOne({userId:tokenData.userId},(err,retrievedTokenData)=>{
                if(err){
                    logger.error('Token Generation failed due to Api Error','UserCon:SaveToekn',10);
                    let response = apiResponse.generate(true,'Token Generation Failed',500,null);
                    reject(response);
                }else if(checkLib.isEmpty(retrievedTokenData)){
                    
                    let newAuth = new authModel({

                        userId      : tokenData.userId,
                        authToken   : tokenData.token,
                        secretKey   : tokenData.secretKey,
                        createdOn   : timeLib.now()
                    })

                    newAuth.save((err,newTokenData)=>{
                        if(err){
                            logger.error('Token Generation Error','userCon:saveToken',10);
                            let response = apiResponse.generate(true,'Token Generation Error',500,null);
                            reject(response);
                        }else{
                            let newTokenResponse = {

                                authToken       : newTokenData.authToken,
                                userDetails     : tokenData.userData

                            }
                            resolve(newTokenResponse);
                        }
                    }) //Saving Token data


                }else{

                    retrievedTokenData.authToken = tokenData.token
                    retrievedTokenData.secretKey = tokenData.secretKey
                    retrievedTokenData.createdOn = timeLib.now();
                    retrievedTokenData.save((err,newTokenData)=>{
                        if(err){
                            logger.error('Token Generation Error','userCon:saveToken',10);
                            let response = apiResponse.generate(true,'Token Generation Error',500,null);
                            reject(response);
                        }else{
                            let newTokenResponse = {

                                authToken       : newTokenData.authToken,
                                userDetails     : tokenData.userData

                            }
                            resolve(newTokenResponse);
                        }
                    }); //Updating existing Token Data

                    

                } // MAin if else ends here 
            }) // Finding Auth ends
        }) //Promise ends here 
    } //Save Token Ends 

     validateUser(req,res)
    .then(validatePassword)
    .then(generateToken)
    .then(saveToken)
    .then((resolve)=>{
        let response = apiResponse.generate(false, 'Login Successful', 200, resolve);
        res.status(200)
        res.send(response);
    }).catch((err)=>{
        console.log(err);
        res.send(err);
    }); //Promise calls ends 



} // Login function ends 



//getAllData Function Starts here
let getAllData = (req,res) => {

    let getData = () => {
        return new Promise((resolve,reject)=>{
            userModal.find()
             .select('-__v -_id -password')
            .lean()
            .exec((err,retrievedUserData) => {
                if(err){
                    let response = apiResponse.generate(true,'Data fetching error',500,null);
                    reject(response);
                }else if(checkLib.isEmpty(retrievedUserData)){
                    let response = apiResponse.generate(true,'No data found',403,null);
                    reject(response);
    
                }else{
                    resolve(retrievedUserData);
                }
    
            });
    
        }) //Promise ends here
    
    } //get data function ends here
    
        // promise functions starts
        getData(req,res)
        .then((resolve) =>{
            let apiresponse = apiResponse.generate(false,'Data found',200,resolve);
            res.send(apiresponse);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        })
    
    } //Get all data Function ends here


    //reset Password 
    let resetPassword = (req,res) =>{

        let validateEmail = () =>{
            // console.log(req.body);
        return new Promise((resolve,reject)=>{
       
        userModal.find({email:req.body.email})
        .exec((err,result)=>{
            if(err){
                let response = apiResponse.generate(true,'Data Fetching error,Please try again',500,null);
                reject(response);
            }else if(checkLib.isEmpty(result)){
                let response = apiResponse.generate(true,'Email not found',403,null);
                reject(response);
            }else{
                resolve(result);
                }
              })
     
             }) //End of promise

            } //End of Validating password


    let generateToken = (userData)=>{
        return new Promise((resolve,reject)=>{
            tokenLib.generate(userData,(err,tokenData)=>{
              if(err){
                let apiResponse = apiResponse.generate(true,'Token Generation failed',500,null);
                reject(apiResponse);
              }else{
                tokenData.userId    = userData.userId;
                tokenData.userData  = userData;
                resolve(tokenData);
              }            
            })//Token Generation ends here 
        })
    } //Generate Token ends here

    let sendMail = (tokenData)=>{
        return new Promise((resolve,reject)=>{
        let mailData = {

            subject  : "Reset Password",
            message  : `<h1>Hello</h1>
                       <p>You are recieving this mail, because we have recieved a password reset request for your account</p>

                       <p><a href='http://resfeber.online/resetpassword/${tokenData.token}'>Reset Password</a></p>

                       <p>Regards<br>
                          <b>Team Tutochan</b>
                       </p>`,
            rcvr : tokenData.userData[0].email,  
            
           } //Mail Data Object

          let response =  mailLib.sendMail(mailData);
          if(response){
            resolve(tokenData);
          }else{
          
            let apiResponse = apiResponse.generate(true,'Mail sending error,Please try again',500,null);
            reject(apiResponse);
          }

        }) //Promise
    } //Send mail

    validateEmail(req,res)
    .then(generateToken)
    .then(sendMail)
    .then(resolve=>{
        let response = apiResponse.generate(false,'Mail has been sent',200,resolve);
        res.send(response);
    }).catch((err)=>{
        console.log(err);
        //res.status(err.status)
        res.send(err);
    }); //Promise calls ends 

    } //Main Reset password


    let getUserId = (req,res) =>{
        // console.log(req.body.name);
        userModal.find({username:req.body.name})
            .exec((err,result)=>{
            // console.log(result);
            if(err){
                let response = apiResponse.generate(true,'Fetch user data error',500,null);
                res.send(response);
            }else if(checkLib.isEmpty(result)){
                let response = apiResponse.generate(true,'No user found',400,null);
                res.send(response);
            }else{
                let response = apiResponse.generate(false,'User data found',200,result);
                res.send(response);
            }
        });
    } //Get userid by name 


    let getUsersList = (req,res) =>{
        userModal.find()
            .exec((err,result)=>{
            // console.log(result);
            if(err){
                let response = apiResponse.generate(true,'Fetch user data error',500,null);
                res.send(response);
            }else if(checkLib.isEmpty(result)){
                let response = apiResponse.generate(true,'User data not found',400,null);
                res.send(response);
            }else{
                let response = apiResponse.generate(false,'User data found',200,result);
                res.send(response);
            }
        });
    } //Get userid by name 



    let UpdateNewPassword = (req,res) => {
      
            let verifyToken = () =>{
                // console.log(req.body);
            return new Promise((resolve,reject)=>{
             tokenLib.verifyWithoutSecret(req.body.token,(err,userData)=>{
            if(err){
                let response = apiResponse.generate(true,'Token validation error',403,null);
                reject(response);
            }else{
                userData.newpass = req.body.newpass;
                resolve(userData);
                }
             
          })
         }) //End of promise
    
        } //verifyToken ends 

        let UpdatePassword = (userData) =>{
            return new Promise((resolve,reject)=>{
               // console.log(userData.data);
                let newpassword = passwordLib.hashpassword(userData.newpass);

                userModal.update({userId:userData.data[0].userId},{$set:{password:newpassword}})
                .exec((err,result)=>{
                if(err){
                    let response = apiResponse.generate(true,'Password updation error,try again',403,null);
                    reject(response);
                }else if(checkLib.isEmpty(result)){
                    let response = apiResponse.generate(true,'Password updation error,try again',403,null);
                    reject(response);
                }else{
                    //console.log(result);
                  resolve(result);
               } //If else statement
        
            }); //Emitting notification to all attendees
            }) //End of promise
        } //End of Update password

        verifyToken(req,res)
        .then(UpdatePassword)
        .then(resolve=>{
            let response = apiResponse.generate(false,'New password updated',200,resolve);
            res.send(response);
        })

    }


    //checkEmailAvailability
let checkEmailAvailability = (req,res) =>{
    return new Promise((resolve,reject)=>{
        userModal.findOne({'email.emailId':req.body.email})
        .exec((err,emailData)=>{
            if(err){
                let response = apiResponse.generate(true,'User creation error',403,null);
                reject(response);
            }else if(checkLib.isEmpty(emailData)){


                let newUser = new userModal({
                    
                    userId          : shortId.generate(),
                    password        : req.body.password != null || req.body.password != "" || req.body.password != undefined ? passwordLib.hashpassword(req.body.password):"",
                    firstName       : req.body.name,
                    lastName        : req.body.lastName || '',
                    email           : { emailId: req.body.email},
                    mobile          : req.body.mobile || '',

                });// New user model ends here 

                //Saving data to DB
                newUser.save((err,newUserData)=>{

                    if(err){
                        let response = apiResponse.generate(true,'User creation error,',403,null);
                         reject(response);
                    }else{
                        let newUserObj = newUserData.toObject();
                        resolve(newUserObj);
                    }

                 })//End of saving data to DB


            }else{

                if(req.body.signUptype == "social"){

                    resolve(emailData);

                }else{

                    logger.error('Email exists','UserCon : checkEmailAvailability',10);
                    let response = apiResponse.generate(true,'Email already exists',403,null);
                    reject(response);
                }

              

            }

        }) //Model find ....


    }); //promise ends here

} //checkEmailAvailability ends here


 //Sending Mail 
 let sendMail = (tokenData)=>{
    console.log(tokenData);
    return new Promise((resolve,reject)=>{
    let mailData = {

        subject  : "Email verification",
        message  : `<h1>Hello</h1>
                   <p>Verify your email to have access to our content</p>

                   <p><a href='http://resfeber.online/resetpassword/${tokenData.token}'>Verify Email</a></p>

                   <p>Regards<br>
                      <b>Team Tutochan</b>
                   </p>`,
        rcvr : tokenData.userData.email.emailId,  
        
       } //Mail Data Object

       console.log(mailData);

      let response =  mailLib.sendMail(mailData); //Sending Mail

      if(response){
        resolve(tokenData);
      }else{
      
        let apiResponse = apiResponse.generate(true,'Mail sending error,Please try again',500,null);
        reject(apiResponse);
      }

    }) //Promise
} //Send mail ends here

 //Token Generation
let generateToken = (userData)=>{
    return new Promise((resolve,reject)=>{
        tokenLib.generate(userData,(err,tokenData)=>{
          if(err){
            let apiResponse = apiResponse.generate(true,'Token Generation failed',500,null);
            reject(apiResponse);
          }else{
            tokenData.userId    = userData.userId;
            tokenData.userData  = userData;
            resolve(tokenData);
          }            
        })//Token Generation ends here 
    })
} //Generate Token ends here



//Event emitter handling

emitter.on('mail',(data)=>{
    generateToken(data)
    .then(sendMail)
    .then((data)=>{
        console.log(data);
    })
    .catch((err)=>{
        console.log(err);
    })
  });



let socialSigIn = (req,res) =>{

    checkEmailAvailability(req,res)
    .then(generateToken)
    .then((data)=>{
        let apiresponse = apiResponse.generate(false,'User authenticated',200,data);
        res.send(apiresponse);
    })
    .catch((err)=>{
        res.send(err);
    })


} 

  




module.exports = {
    signUpFn         : signUpFn,
    signInFn         : signInFn,
    socialSigIn      : socialSigIn,
    getAllData       : getAllData,
    getUserId        : getUserId,
    getUsersList     : getUsersList,
    resetPassword    : resetPassword,
    UpdateNewPassword : UpdateNewPassword
}
const mongoose       = require('mongoose');//Including Express
const apiResponse    = require('../libs/responseGenLib'); // Response generation Library
const checkLib       = require('../libs/checkLib'); // Data validation Library
const shortId        = require('shortid'); //unique id generator.
const passwordLib    = require('../libs/passwordLib') // Password handling Library . hashpassword ,compare password etc..
const tokenLib       = require('../libs/tokenLib'); //Token Library
const logger         = require('../libs/logger') //Logging Library.
const timeLib        = require('../libs/timeLib') //Date and time handling Library.
const mailLib        = require('../libs/sendMailLib'); //Mail Library. 
const events         = require('events') //Evemt Emitter.
const razorPay       = require('../libs/razorpayLib'); // razorPay Library
const { resetPassword } = require('./usersCon');
const razorPayInst   = razorPay.instance
let create_order = (req,res) =>{
    var options = {
        amount: 50000,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11",
        payment_capture: '0'
      };
      razorPayInst.orders.create(options, function(err, order) {
        res.send(order);
      });
}


module.exports = {
    create_order : create_order
}



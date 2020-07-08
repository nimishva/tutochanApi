const mongoose   = require('mongoose');
const timeLib    = require('../libs/timeLib');

Schema = mongoose.Schema

let subSchema = ({

    sub_id   :{
        type      : String,
        default   : "",
        index     : true,
        unique    : true
    },
    user_id  :{
        type      : String 
    },
    razorpay_order_id :{
        type      : String  
    },  
    razorpay_payment_id:{
        type      : String  
    },
    razorpay_signature : {
              type : String
    },
    sub_type :{ 
        type      : String 
    },
    sub_amount:{
        type      : Number
    },
    currency      :{
        type      : String,
        default   : "INR"
    },
    payment_success:{
        type      : Boolean,
        default   : false  
    },
    subcribed_on : {
        type : Date
    }    

})


mongoose.model('Subscription',subSchema);



const mongoose = require('mongoose'); // Includig Mongoose Package
const timeLib  = require('../libs/timeLib');

Schema = mongoose.Schema;

let userSchema = new Schema ( {

        userId  : {

             type        : String,
             default     : "",
             index       : true,
             unique      : true

        },

        username : {

             type        : String,
             default     : "",
    
        },

        password  : {

             type        : String,
             default     : "",

        },

        firstName : {

             type        : String,
             default     : "",

        },

        lastName   : {

             type        : String,
             default     : "",

        },
        
          email    : {

             emailId : String,
             verified : { type: Boolean , default:false }

        },

         mobile   : {

             type        : Number,
             default     : 0,

        },

        createdOn :{

            type:Date,
            default:timeLib.now()

          },
     subscribed :{

               type : Boolean,
               default: false
          },
     subscriptionDetails : { 

          plan: String,
          subscribedOn : Date

          }

});


mongoose.model('Users',userSchema);


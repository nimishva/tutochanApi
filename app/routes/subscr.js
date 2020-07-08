const express           = require('express'); //Including Express
const router            = express.Router();
const appConfig         = require('../../config/appConfig'); //Including appConfig file
const subscrController    = require('../controllers/subscriptionCon'); //Including Controller file

let setRouter = (app) =>{

   let baseUrl = `${appConfig.apiVersion}/subscr`; //Declaring baseUrl 


    app.post(`${baseUrl}/createOrder`,subscrController.create_order);

    /**
	 * @api {post} /api/v1/events/newEvent Create New Event
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "New event Created",
	    "status": 200,
	    "data": [
					{
						eventId: "string",
						start: "date",
						end: "date",
						title: "string",
						attendees: array,
						location: string,
						description: "string",
						author: "string",
						createdBy: string
					}
	    		]
	    	}
		}
	}
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed To create new event",
	    "status": 500,
	    "data": null
	   }
	 */

};


module.exports = {
    setRouter : setRouter
}
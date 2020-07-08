const razorPay = require('razorpay');

let config = {
    key_id : 'rzp_test_PDt9MP7gIRoNOH',
    key_secret : 'UsMx6IlBOW8yqG6rsLmMUjYx'
}

const instance = new razorPay(config);

module.exports = {
    config : config,
    instance : instance
}


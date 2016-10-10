// grab the things we need
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;



// set the discriminator key, which allows model extension
var options = {discriminatorKey: 'kind'};

// create a schema
var user_schema = new Schema({
      username: { type: String, required: true, unique: true },
      password_hash: String ,
      active: { type: Boolean, default: true, required: true },
      admin: { type: Boolean, default: false},
      first_name: String,
      middle_name: String,
      last_name: String,
      phone: {
        primary: String,
        secondary: String
      },
      email: {
        primary:String,
        secondary: String
      },
      mailing_address:{
        street: String,
        city: String,
        state: String,
        zip: Number
      },
      shipping_address:{
        street: String,
        city: String,
        state: String,
        zip: Number
      },
      created_at: { type: Date, default: Date() },
      updated_at: Date
    }, options);


var user_model =  mongoose.model('User', user_schema );


// make this available to our users in our Node applications
module.exports = {
        schema: user_schema,
        model: user_model
      }
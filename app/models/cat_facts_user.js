// grab the things we need
var mongoose = require('mongoose');
var stripe = require('stripe')("sk_test_lZBQXOzeaJ9mfbWMGQbwdXrt");
var CatFactUser = require('./cat_facts_user').model
var faker = require('faker')


if(mongoose.connection.readyState == 0){
    mongoose.connect('mongodb://localhost/catfacts');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
}

// base
var User = require('../../lib/models/user');

// set the discriminator key
var options = {discriminatorKey: 'kind'};

// this is an extended schema, based on the base lib/user schema.
var cat_facts_user_schema = new mongoose.Schema({
  service_id: {
          stripe: {type: String, required: true},
          stormpath: {type: String, required: true}
  },
  recipients: [
    {
      username: { type: String, required: true, unique: true },
      phone: { type: Number, required: true },
      interval: { type: Number, required: true, default: 0 },
      number_sent: { type: Number, required: true, default: 0 }
    }
  ],
  account:{
    messages_used: { type: Number, default: 0 },
    messages_remaining: { type: Number, default: 0 },
    //credit_card: { type: Number, default: null }
  }
}, options)


// message CRUD
cat_facts_user_schema.methods.addMessages = function(number_of_messages, callback) {
  this.account.messages_remaining += number_of_messages;
  this.save()
   .then(function(obj){
     if(callback) return callback(false, obj);
   })
   .catch(function(err){
     if(callback) return callback(err);
     throw err;
   })
};

// assign a function to the "methods" object of our animalSchema
cat_facts_user_schema.methods.removeMessages = function(number_of_messages, callback) {
  current_messages = this.account.messages_remaining

  // error  logic
  if( ( current_messages - number_of_messages) < 0){
      if(callback) return callback( new RangeError("Cannot decrease messages below zero."));
      throw new RangeError("Cannot decrease messages below zero.")
  }
  else
  {

    // good logic
    this.messages_used += number_of_messages;
    this.account.messages_remaining -= number_of_messages;


    // save logic goes here
    this.save()
     .then(function(obj){
       if(callback) return callback(false, obj);
     })
     .catch(function(err){
       if(callback) return callback(err);
       throw err;
     })
  }
};

// assign a function to the "methods" object of our animalSchema
cat_facts_user_schema.methods.getMessages = function() {
  return this.account.messages_remaining;
};


// recipient CRUD
// assign a function to the "methods" object of our animalSchema
cat_facts_user_schema.methods.getRecipients = function() {
  return this.recipients;
};


// assign a function to the "methods" object of our animalSchema
cat_facts_user_schema.methods.addRecipientJson = function(json_recipient, callback) {
  this.recipients.push(json_recipient);
  this.save()
  .then(function(obj){
    if(callback) return callback(false, obj);
  })
  .catch(function(err){
    if(callback) return callback(err);
    throw err;
  })
};


// assign a function to the "methods" object of our animalSchema
cat_facts_user_schema.methods.addRecipient = function(username, phone, interval, number_sent, callback) {
  this.recipients.push({
    username:username,
    phone:phone,
    interval:interval,
    number_sent:number_sent
  })
  this.save()
  .then(function(obj){
    if(callback) return callback(false, obj);
  })
  .catch(function(err){
    if(callback) return callback(err);
    throw err;
  })
};

// assign a function to the "methods" object of our animalSchema
cat_facts_user_schema.methods.removeRecipient = function(in_username) {

  this.recipients.forEach(function(result, index) {
    if(result === in_username) array.splice(index, 1);
  })


  this.save()
  .then(function(obj){
    if(callback) return callback(false, obj);
  })
  .catch(function(err){
    if(callback) return callback(err);
    throw err;
  })

};



// Card Crud
cat_facts_user_schema.methods.update_card = function(new_card_token, callback){

  // this is pure stripe logic
  // do not  want to keep  credit card info locally

  // stripe.customers.update(
  //   stripe_customer_id,
  //   {
  //     source: new_card_token
  //   },
  //   function(err, customer) {
  //     completion_action.call(this,
  //       err,
  //       customer.sources.data,
  //       callback
  //     )
  //   }
  // )

  console.log(this.username + " card would be updated")
}

cat_facts_user_schema.methods.delete_card = function(callback){
  // stripe.customers.deleteCard(
  //   stripe_customer_id,
  //   card_token,
  //   function(err, confirmation) {
  //       completion_action.call(this,
  //         err,
  //         confirmation,
  //         callback )
  //   }
  // )

  console.log(this.username + " card would be deleted")
}








// figure out how to return both a promise and a callback like mongoose does
cat_facts_user_schema.statics.createWithStripe = function(username, stormpath_id, callback) {

  var this_model = this;
  var stripe_id;

      stripe.customers.create({
        description: 'Catfacts User'
      })
      .then(function(user){
        console.log("Stripe customer created successfully: " + user.id);
        stripe_id = user.id;
        return this_model.create({
          'username': username,
          'service_id.stripe': user.id,
          'service_id.stormpath': stormpath_id
        })
      })
      .then( function(mongo_user){
        console.log("Mongo User created successfully")
        return callback(false, mongo_user);
      })
      .catch(function(err){
        //rollback ops
        stripe.customers.del(stripe_id, function(err, conf){
          if(err) console.log("Unable to delete: " + stripe_id);
          console.log("Stripe Customer deleted successfully: " + conf.id)
        })
        return callback(err);
      });
}


cat_facts_user_schema.methods.deleteWithStripe = function(callback) {

  var this_model = this;

      stripe.customers.del(
        this_model.service_id.stripe
      )
      .then(function(){
        return this_model.remove()
      })
      .then(function(obj){
        callback(false, obj);
      })
      .catch(function(err) {
        callback(err);
      });
}


cat_facts_user_schema.statics.createTest = function(callback) {

      this.create({
          'username': faker.internet.email(),
          'service_id.stripe': "test",
          'service_id.stormpath': "test"
      })
      .then(function(obj){
        return callback(false, obj);
      })
      .catch(function(err) {
        callback(err);
      });

}



// create intermediate Base model
var BaseUser = User.model

// create final model which is the union of the Base model and  the  cat_facts schema
var cat_facts_user_model = BaseUser.discriminator('CatFactsUser', cat_facts_user_schema );


// make this available to our users in our Node applications
module.exports = {
    schema: cat_facts_user_schema,
    model: cat_facts_user_model
  }
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
  },
  credit_card:[
    {
      brand: {type: String, required: true},
      last4: {type: Number, required: true},
      exp_year: {type: Number, required: true},
      exp_month: {type: Number, required: true},
      address_zip: {type: Number, required: true},
      stripe_id: {type: String, required: true}
    }
  ]
}, options)


// interval crud
cat_facts_user_schema.methods.change_recipient_interval = function(recipient_username, new_interval){
  this_model = this

  this_model.recipients.forEach(function(result, index) {
    if(result.username === recipient_username) result.interval = new_interval;
  })
  return this.save()
}

// recipient CRUD
cat_facts_user_schema.methods.get_recipients = function() {
  return this.recipients;
};

cat_facts_user_schema.methods.add_recipient_json = function(json_recipient) {
  this.recipients.push(json_recipient);
  return this.save()
};

cat_facts_user_schema.methods.add_recipient = function(username, phone, interval, number_sent) {
  this.recipients.push({
    username:username,
    phone:phone,
    interval:interval,
    number_sent:number_sent
  })
  return this.save()
};

cat_facts_user_schema.methods.remove_recipient = function(recipient_username) {
  this_model = this

  this_model.recipients.forEach(function(result, index) {
    if(result.username === recipient_username) this_model.recipients.splice(index, 1);
  })
  return this.save()
};



// message CRUD
cat_facts_user_schema.methods.buy_messages = function(amount_in_cents, cost_per_msg_in_cents){
  var this_model =  this
  var num_msg = Math.round(amount_in_cents / cost_per_msg_in_cents);
  return  this_model.charge_stripe(amount_in_cents, "Charge for Catfacts. Thank you meow.")
  .then(function(charge_obj){
    console.log(charge_obj)
    return this_model.add_messages(num_msg)
  })
}

cat_facts_user_schema.methods.add_messages = function(number_of_messages) {
  this.account.messages_remaining += number_of_messages;
  return this.save()
};

cat_facts_user_schema.methods.subtract_messages = function(number_of_messages) {
  var current_messages = this.account.messages_remaining

  if( (current_messages - number_of_messages) < 0){
      throw new RangeError("Cannot decrease messages below zero.")
  }
  else
  {
    this.messages_used += number_of_messages;
    this.account.messages_remaining -= number_of_messages;
    return this.save()
  }
};

cat_facts_user_schema.methods.get_messages = function() {
  return this.account.messages_remaining;
};


// Card Crud
cat_facts_user_schema.methods.update_card = function(new_card_token){
  var this_model = this;
  return stripe.customers.update(this_model.service_id.stripe,
    {
      source: new_card_token
    }
  )
  .then(function(result){

    var cc = result.sources.data[0];

    var new_card = {
      brand:  cc.brand,
      last4:  cc.last4,
      exp_year:  cc.exp_year,
      exp_month:  cc.exp_month,
      address_zip:  cc.address_zip,
      stripe_id: cc.id
    }

    this_model.credit_card.push(new_card);
    return this_model.save()
  })
}

cat_facts_user_schema.methods.delete_card = function(){

  this_user = this

  return stripe.customers.deleteCard(
    this_user.service_id.stripe,
    this_user.credit_card[0].stripe_id
  )
  .then(function(obj){
    if (this_user.credit_card[0]){
      this_user.credit_card.splice(0, 1)
    }
    return this_user.save()
  })
}


// USER crud
cat_facts_user_schema.methods.delete_me= function() {

  var this_model = this;

      return stripe.customers.del(
        this_model.service_id.stripe
      )
      .then(function(){
        return this_model.remove()
      })
}

// weird naming  to avoid overwriting the base create method
cat_facts_user_schema.statics.create_new = function(username, stormpath_id) {

      var this_model = this;

      return stripe.customers.create({
        description: 'Catfacts User'
      })
      .then(function(stripe_user){
        return this_model.create({
                          'username': username,
                          'service_id.stripe': stripe_user.id,
                          'service_id.stormpath': stormpath_id
        })
      })
      .catch(function(err){
        // do error cleanup here?
          throw err;
      });
}


// Utility methods
// Creates a fake user without hitting Stripe
cat_facts_user_schema.statics.create_fake_user = function() {

      return this.create({
          'username': faker.internet.email(),
          'service_id.stripe': "test",
          'service_id.stormpath': "test"
      })
}

cat_facts_user_schema.statics.create_test_recipient = function(){

  var fake_recipient = {
      username: faker.internet.email(),
      phone: faker.phone.phoneNumberFormat().replace(/\D/g,''),
      interval: 1,
      number_sent: 0
    }

  return fake_recipient;
}


cat_facts_user_schema.methods.charge_stripe = function(amount_in_cents, description){

      return stripe.charges.create({
        amount: amount_in_cents,
        currency: "usd",
        customer: this.service_id.stripe,
        description: description
        })
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
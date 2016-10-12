User = require('./app/models/cat_facts_user').model
cc = require('./app/helpers/credit_card')
faker = require('faker')

var user;

// User.find({username: 'Cali75@yahoo.com'}).then(function(result){
//   user =result
// })


User.findOne({username:'Cali75@yahoo.com'}).then(function(user){
  return user.update_card(stripe_token);
}).then(function(result){
  console.log("result" + result)
})
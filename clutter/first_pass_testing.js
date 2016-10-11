var user;
var card;
var recipient;

User = require('./app/models/cat_facts_user').model
cc = require('./app/helpers/credit_card')
faker = require('faker')

// User.createWithStripe(faker.internet.email(), "test", function(x, out){
//       user = out;
//       cc.create_test_credit_card_token(function(err, result){
//           user.update_card(result.id, function(err,cb){
//             console.log("Credit Card Added:")
//             console.log(user)


//             user.delete_card()
//             .then(function(obj){
//               console.log("this is from the  delete_card promise return")
//             })
//             .catch(function(err){
//               throw err
//             })



//           })
//       })
// })



// User.createTest().then( function(obj){
//   console.log(obj)
// })

// User.createNew(faker.internet.email(), "test").then( function(obj){
//     console.log("Mongo User Created " + obj)
//     console.log(obj);
//     user = obj
// })


// Create User
User.create_new(faker.internet.email(), "test").then(function(obj){

  user = obj
  console.log("New User Created: \n" + user);

// Create Card and Add to User
}).then(function() {
        return cc.create_test_credit_card_token().then(function(obj){
          card = obj
          console.log("Credit Card Token created: \n" + JSON.stringify(card) )
        }).then(function(){
          // add token to card
          console.log("Updating card: " + card.id)
          return user.update_card(card.id).then(function(updated_user){
            user = updated_user
          })
        })
}).then(function(){
  return user.charge_stripe("5000", "For glorius emperor Trump");
}).then(function(obj){

  console.log("Subtracting  Messages")
  console.log("Current Message Amount: " + user.get_messages() )

  return user.buy_messages(1000, 2).then(function(){
    return user.subtract_messages(10).then(function(){
      console.log("New Message Amount: " + user.get_messages() )
    })
  })
}).then(function(){
    var recip = User.create_test_recipient()
    recipient = recip;
    return user.add_recipient_json(recip)
}).then(function(){
    var recip = User.create_test_recipient()
    return user.add_recipient_json(recip)
}).then(function(){
    console.log("Removing  recipient: " + recipient.username)
    return user.remove_recipient(recipient.username)
}).then(function(){
    console.log("Changing Interval: " + user.recipients[0].username)
    return user.change_recipient_interval(user.recipients[0].username, 20)
}).catch(function(err){console.log(err)})









// .then(function(){


//   console.log("Deleting Card");
//   return user.delete_card();

// }).then(function(){

//   console.log("Card Deleted")
//   console.log(user)

// }).catch(function(err){throw err})


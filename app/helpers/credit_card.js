var stripe = require('stripe')("sk_test_lZBQXOzeaJ9mfbWMGQbwdXrt");
// This just creates a TOKEN with an id of tok_xxxxxx
// To convert to a card object with id of card_xxxx
// must use  card API or set customer.source with it
// (see update customer API)
var create_test_credit_card_token = function(){
  return create_credit_card_token(
    '4242424242424242',
    12,
    2017,
    '123',
    90210
  )
  .catch(function(err){throw err})
}


// use this to  get a token server side.
///(Note: this is typically done client side on web. This method might be useful on mobile.)
// THIS JUST RETURNS A TOKEN with id: tok_xxxxx
// Must send to server OR update customer.source to convert to a card_xxxx
var create_credit_card_token = function(card_num, exp_month, exp_year, cvc, zip){
  return stripe.tokens.create({
      card: {
        "number": card_num,
        "exp_month": exp_month,
        "exp_year": exp_year,
        "cvc": cvc,
        "address_zip": zip
      }
    })
    .catch(function(err){throw err})
}

module.exports = {
    create_credit_card_token:create_credit_card_token,
    create_test_credit_card_token: create_test_credit_card_token
}
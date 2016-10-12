cc = require('./app/helpers/credit_card')


cc.create_test_credit_card_token().then(function(result){console.log(result)})
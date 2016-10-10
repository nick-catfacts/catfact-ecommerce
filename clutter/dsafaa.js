  stripe.customers.create({
    username: username
  }).then(function(customer) {

  }).then(function(charge) {
    // New charge created on a new customer
  }, function(err) {
    // Deal with an error
  });
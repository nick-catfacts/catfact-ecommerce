User.create({
          'username': "ADf",
          'service_id.stripe': "test",
          'service_id.stormpath': "test"
      })
      .then( function (x){
        console.log(x);
      })
      .catch(function(err) {
        console.log(err);
      });
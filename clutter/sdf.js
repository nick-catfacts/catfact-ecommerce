// assign a function to the "statics" object of our animalSchema
cat_facts_user_schema.statics.createWithStripe = function(username, cb) {

  this.create({ username:username} })
    .then(function(obj){
        console.log(obj)
      })
    .catch(function(err){
        console.log(err);
    })

}


  return this.find({ name: new RegExp(name, 'i') }, cb);
};



User.model.create({'username':"asdf", "service_id.stripe":"sdf"}).then( function(obj){ console.log(obj) } ).catch( function(err){ console.log(err) } )
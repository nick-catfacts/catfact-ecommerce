.create({ username:username} })
    .then(function(obj){
        console.log(obj)
      })
    .catch(function(err){
        console.log(err);
    })
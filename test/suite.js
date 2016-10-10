'use strict';


var config = require('../config');
var mongodb = require('mongodb');
var mongodb_client = require('mongodb').MongoClient;
var database_cleaner = require('database-cleaner');
var mongodb_cleaner = new database_cleaner('mongodb');



before(function(done){
  console.log("Running Before Suite Actions");

  mongodb_client.connect(config.db.test, function(err, database) {
    if(err) console.log(err);

    mongodb_cleaner.clean(database, function(){
        console.log("Database Cleaned.")
        database.close();
        done();
    });
  });
});



after(function (done) {
  console.log("Running After Suite Actions.");
  done();
});

// // db_connection.collectionNames(function(err, result){
// //   if(err) console.log(err);
// //   console.log(result);
// // });

// // mongo_cleaner.clean(db_connection, function(){
// //     console.log("cleaned")
// // });


// db_connection.close();
// before(function(done){

//   // clean up the database
//   mongo_cleaner.clean(db_connection, function(){
//     console.log("cleaned")
//   });

//   done();
// })


// after(function (done) {
//   db_connection.close();
//   done();
// });



// db_connection.collection("users").find({}, function(err, docs) {
//     docs.each(function(err, doc) {
//       if(doc) {
//         console.log(doc);
//       }
//       else {
//         console.log("wat")
//       }
//     });
// })


// var db_connection;

// mongodb_client.connect("mongodb://localhost:27017/catfacts_test", function(err, database) {
//   console.log("Connecting  to Database.");
//   if(err) console.log(err);
//   db_connection = database;
// })

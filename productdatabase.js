const dotenv=require("dotenv");
dotenv.config();
const express =require("express");
var bodyParser = require("body-parser");
const app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const passport=require('passport')
const passportJWT=require('passport-jwt')
const JwtStrategy=passportJWT.Strategy;
const ExtractJwt=passportJWT.ExtractJwt;
const jwt=require("jsonwebtoken");
var Cryptr = require('cryptr');
cryptr=new Cryptr('ksffnh')
var fileupload=require("express-fileupload")
app.use(fileupload());
var XLSX = require('xlsx');
//const Get_product = require('./work_2.js');
var Promise = require('promise');
const opts={
  jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey:process.env.SECRET_OR_KEY
};

const strategy=new JwtStrategy(opts,(payload,next)=>{
  const user=null;
  next(null,user);
});
passport.use(strategy);
app.use(passport.initialize());
var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/Nutritiondatabase";
var dbo;
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
    dbo = db.db("Nutritiondatabase");
    dbo.createCollection("Tokencollection", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");


    });
var currentDateTime;

//Function for token verification
function tokenverification(token){
      try{
        var decoded = jwt.verify(token["token"], process.env.SECRET_OR_KEY,function(err, decoded) {
            if (err) throw new Error(Tokenexpire)
            console.log("decoded",decoded)
        });
        return 'passed'

     }catch(Tokenexpire){
              dbo.collection("Tokencollection").deleteOne({"Token":token["token"]}, function(err, obj) {
                  if (err) throw err;
              });
              return 'not passed'

     }
 }
// Get Username Password
app.post('/get_logindetails',(req,res)=>{
   if(!req.body.Username || !req.body.Password){
     return res.status(500).send('No fields');
   }
   var get_request=req.body;
   var get_password=get_request["Password"]
   str_password=String(get_password)
   var encrystring=cryptr.encrypt(str_password)
   dbo.collection("Users").insertOne({"Username":get_request["Username"],"Password":encrystring},function(err, res) {
      if (err) throw err;

  });
   res.send("Stored successfully in mongodb")


});
//Generating Token
app.post('/generate_token/product',(req,res)=>{
   if(!req.body.Username || !req.body.Password){
     return res.status(500).send('No fields');
   }
  try{
      var get_request=req.body;
      var get_value=get_request["Password"]
      console.log(get_value)
      dbo.collection("Users").find({"Username":get_request["Username"]}).toArray(function(err, result) {
         if (err) throw err;
         var get_password=result[0]["Password"]
         var decrystring=cryptr.decrypt(get_password)
         console.log(decrystring)

          /*dbo.collection("Users").find({"Username":get_request["Username"],"Password":decrystring}).toArray(function(err, result) {
             if (err) throw err;
             console.log(result)

             if (result.length!=0){*/
             if (get_value==decrystring){
                const payload = { id:req.body.Username };
                //console.log(payload)
                const token = jwt.sign(payload, process.env.SECRET_OR_KEY,{expiresIn:'2m'});
                var get_token={"Token":token}
                //console.log(get_token)
                dbo.collection("Tokencollection").insertOne({"Username":get_request["Username"],"Token":token},function(err, res) {
                   if (err) throw err;
                 });
                res.send({"Token":token});
             } else{
               res.send("Invalid Username and Password")
             }
           //})
      })
 }catch(err){
         res.status(500).send("Can't read property")
 }
});


//If token is valid send list of
app.get('/test_token/product',(req,res)=>{
  const token = req.headers ;
  if (!token) return res.status(500).send("Access denied. No token provided.");
  console.log(token)
  try{
      var decoded = jwt.verify(token["token"], process.env.SECRET_OR_KEY,function(err, decoded) {
          if (err) throw new Error(Tokenexpire)

          res.send(decoded)
      });
   }catch(Tokenexpire){
            res.status(500).send({
                message:Tokenexpire=Object.assign({},{"status":"Tokenexpire"})
            })
   }

});
//Inserting data in database without duplicates
app.post('/insert/product',(req,res)=>{
  var get_request=req.body;
  const token = req.headers ;
  if (!token["token"]) return res.status(500).send("Access denied. No token provided.");
         if (tokenverification(token)=='passed'){
               try{
                   var get_request;
                   var get_request=req.body;
                   dbo.collection("Productcollection").find({"Username":get_request["Username"]}).toArray(function(err, result) {
                         if (err) throw err;
                         if (result.length!=0){
                           res.send("already exist")
                         } else {
                             var datetime={"datetime":Date()};
                             var status={isdeleted:"NO"}
                             var insert_details= Object.assign({}, get_request,datetime,status);
                             console.log(insert_details);
                             dbo.collection("Productcollection").insertOne(insert_details, function(err, res) {
                                if (err) throw err;
                             });
                             res.send({"Message":"Inserted successfully"})
                         }
                   });
              }catch(err){
                res.status(500).send({
                    message:err=Object.assign({},{"status":"Something went wrong..."})
                })
              }
       }else {
         res.status(500).send({
             message:Tokenexpire=Object.assign({},{"status":"Tokenexpire"})
         })

       }
});

//Sending data from database to client
app.get('/get/product',(req,res)=>{
  const token = req.headers ;
  if (!token["token"]) return res.status(500).send("Access denied. No token provided.");
  var test_token=tokenverification(token)
  new Get_product(token,dbo,res,test_token).generate_token()


});
//getting updated data and overwrite  in database
app.put('/update/product',(req,res)=>{
  var update_details=req.body;
  const token = req.headers ;
  if (!token["token"]) return res.status(500).send("Access denied. No token provided.");

  if (tokenverification(token)=='passed'){
               try{

                   var update=Object.assign({},update_details,{"datetime":Date()})
                   var need_to_update={$set:update};
                   var key_field={"Product_Name" :update_details["Product_Name"],"isdeleted":"NO"}
                   dbo.collection("Productcollection").updateMany(key_field,need_to_update, function(err, res) {
                     if (err) throw err;
                     console.log("update");

                   });
                   res.send({"Message":"Updated successfully"});
                }catch(err){
                  res.send("Updated failure")
                }


  }else{
    res.status(500).send({
        message:Tokenexpire=Object.assign({},{"status":"Tokenexpire. Invalid"})
    })

 }

});

// Delete url for delete single and multiple document temporary
app.delete('/delete/product',(req,res)=>{
  if(!req.body.Product[0]){
    return res.status(500).send('No fields');
  }
  const token = req.headers ;
  if (!token["token"]) return res.status(500).send("Access denied. No token provided.");
  if (tokenverification(token)=='passed'){
       try{
            var get_request=req.body;
            var array_items=get_request["Product"]
            var get_objectvalue;
            array_items.forEach((element) => {
              var get_objectvalue=element.Product_Name
              dbo.collection("Productcollection").find( { "Product_Name":get_objectvalue}).toArray(function(err, result) {
                  if (err) throw err;
                  console.log(result)
              var find_value= result[0]["Product_Name"];
              if (get_objectvalue==find_value){
                 var key_field={"Product_Name" :get_objectvalue,"isdeleted":"NO"}
                 var need_to_change={$set:{isdeleted:"YES"}};
                 if ({"isdeleted":"NO"}){
                    dbo.collection("Productcollection").updateMany(key_field,need_to_change, function(err, res) {
                        if (err) throw err;
                    });
                 }
              }
              console.log(get_objectvalue)
              });

            });
            res.send({"Message":"Deleted successfully"})


      }catch(err){
               res.status(500).send("Can't read property")
      }
  }else{
    res.status(500).send({
        message:Tokenexpire=Object.assign({},{"status":"Tokenexpire. Invalid"})
    })

 }
});
//Uploading Excel file
app.post('/get_excel/product',(req,res)=>{
  console.log("req",req)
  if(!req.files){
    return res.status(500).send('No files were uploaded');
  }
  const token = req.headers ;
  if (!token["token"]) return res.status(500).send("Access denied. No token provided.");
  if (tokenverification(token)=='passed'){
      var get_file=req.files;
      //console.log(get_file)
      var file=get_file['file']

      var file_2=file['name']
      var workbook = XLSX.readFile(file_2);
      var sheet_name_list = workbook.SheetNames;
      var xlData;
      var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

      try{
          dbo.collection("Productcollection").find({"Username":xlData[0]["Username"]}).toArray(function(err, result) {
                if (err) throw err;
                console.log("result info",result)
                if (result.length!=0){
                  res.send("already exist")
                } else {
                        var get_datetime={"datetime":Date()}
                        var status={isdeleted:"NO"}
                        xlData[0]["datetime"]=get_datetime.datetime;
                        xlData[0]["isdeleted"]=status.isdeleted
                        dbo.collection("Productcollection").insertMany(xlData, function(err, res) {
                           if (err) throw err;
                        });
                         res.send("File uploaded successfully")
               }
           });
         }catch(err){
                  res.status(500).send("Can't read property")
         }
  }else{
    res.status(500).send({
        message:Tokenexpire=Object.assign({},{"status":"Tokenexpire. Invalid"})
    })

  }

});
});
app.listen(3000);

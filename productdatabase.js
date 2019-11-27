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
var fileupload=require("express-fileupload")
app.use(fileupload());


var XLSX = require('xlsx');




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



//Generating Token
app.post('/generate_token/product',(req,res)=>{
   if(!req.body.Username || !req.body.Password){
     return res.status(500).send('No fields');
   }
  try{
  var get_request=req.body;
  dbo.collection("Users").find({"Username":get_request["Username"],"Password":get_request["Password"]}).toArray(function(err, result) {
     if (err) throw err;
     if (result.length!=0){
        const payload = { id:req.body.Username };

        const token = jwt.sign(payload, process.env.SECRET_OR_KEY,{expiresIn:'2m'});
        var get_token={"Token":token}

        result[0]["Token"]=get_token.Token
        console.log(result)
        dbo.collection("Tokencollection").insertMany(result,function(err, res) {
           if (err) throw err;
         });
        res.send({"Token":token});
     } else{
       res.send("Invalid Username and Password")
     }
   })
 }catch(err){
         res.status(500).send("Can't read property")
 }
});


//If token is valid send list of
app.get('/test_token/product',(req,res)=>{
  const token = req.headers;
  if (!token) return res.status(500).send("Access denied. No token provided.");
  //var get_token=req.body;
    try{
        var decoded = jwt.verify(token, process.env.SECRET_OR_KEY,function(err, decoded) {
            if (err) throw new Error(Tokenexpire)
            if(Tokenexpire){
              dbo.collection("Tokencollection").find({"Token":["Token"]}).toArray(function(err, result) {
                    if (err) throw err;
              });

            }

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
   if(!req.body.Product_Name){
     return res.status(500).send('No fields');
   }
   try{
       var get_request;
       var get_request=req.body;
       dbo.collection("Productcollection").find({"User Id":get_request["User Id"]}).toArray(function(err, result) {
             if (err) throw err;

             if (result.length!=0){
               res.send("already exist")
             } else {
               var currentDateTime= new Date();
               var datetime={"datetime":currentDateTime};
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
});

//Sending data from database to client
app.get('/get/product',(req,res)=>{
  /*if(!req.body.Product_Name){
    return res.status(400).send('No fields');
  }*/
  try{
      dbo.collection("Productcollection").find({"isdeleted":"NO"}).toArray(function(err, result) {
            if (err) throw err;
            res.send({express: result})
      });
  }catch(err){
    res.status(500).send({

        message:err=Object.assign({},{"status":"Something went wrong..."})
    })

  }
});
//getting updated data and overwrite  in database
app.put('/update/product',(req,res)=>{
  if(!req.body.Product_Name){
    return res.status(400).send('No fields');
  }
  try{
     var update_details=req.body;
     var need_to_update={$set:update_details.data,$currentDate: {"datetime":true  }};
     var key_field={"Product_Name" :update_details.data["Product_Name"],"isdeleted":"NO"}
     dbo.collection("Productcollection").updateMany(key_field,need_to_update, function(err, res) {
       if (err) throw err;
       console.log("updated!");

     });
     res.send({"Message":"Updated successfully"});
  }catch(err){
    res.status(500).send({

        message:err=Object.assign({},{"status":"Something went wrong..."})
    });

  }

});

// Delete url for delete single and multiple document temporary
app.delete('/delete/product',(req,res)=>{
  /*if(!req.body.Product){
    return res.status(500).send('No fields');
  }*/
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
});
//Uploading Excel file
app.post('/get_excel/product',(req,res)=>{
  if(!req.files){
    return res.status(500).send('No files were uploaded');
  }
  try{
      var get_file=req.files;
      var file=get_file['file']
      var file_2=file['name']
      var workbook = XLSX.readFile(file_2);
      var sheet_name_list = workbook.SheetNames;
      var xlData;
      var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
      console.log("xlData info",xlData)
      dbo.collection("Productcollection").find({"User_Id":xlData[0]["User_Id"]}).toArray(function(err, result) {
            if (err) throw err;
            console.log("result info",result)
            if (result.length!=0){
              res.send("already exist")
            } else {
                    var currentDateTime= new Date();
                    var get_datetime={"datetime":currentDateTime}
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
});
});

app.listen(3000);

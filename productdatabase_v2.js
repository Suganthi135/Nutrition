module.exports = function(token){
  var decoded = jwt.verify(token["Tk"], process.env.SECRET_OR_KEY,function(err, decoded) {

      if(err){
         dbo.collection("Tokencollection").deleteOne({"Token":token["token"]}, function(err, obj) {
             if (err) throw err;
              res.send({"Message":"Tokenexpire. Invalidtoken"})
         });
      }
  });     

}

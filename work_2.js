class Get_product{
  constructor(token,dbo,res,test_token){
    this.token=token;
    this.dbo=dbo;
    this.res=res;
    this.test_token=test_token;

  }
read_mongodb(){
    var a=this.dbo
    var promise = new Promise(function(resolve, reject){

      a.collection("Productcollection").find({"isdeleted":"NO"}).toArray(function(err, result) {
          if (err) throw err;
            resolve(result);
      //this.res.send({'message':result})
            //console.log(result)
      });
      this.res.send({'message':result})
    });
   promise.then(function(result){
          console.log("then",result)


   })

 }


}//class
module.exports=Get_product;

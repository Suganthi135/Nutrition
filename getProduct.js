

class Get_product{
  constructor(token,dbo,res,test_token){
    this.token=token;
    this.dbo=dbo;
    this.res=res;
    this.test_token=test_token;

  }

  
  read_mongodb(){
    var a=this.dbo
    var p1;

    var p1=new Promise(function callback_mangdodb(resolve,reject){

       // a.collection("Productcollection").find({"isdeleted":"NO"}).toArray(function(err, result) {
       //    if (err) throw err;
       resolve(1)
          //var x=a
          //console.log("result",1)
     //});
     p1.then(function(val){
      console.log("callback statrted")

    })
    callback_mangdodb(1)

  });
 }
 generate_token(){
         if (this.test_token!='passed'){

                  this.read_mongodb()
                  this.res.send({'message':"a"})


      }else{
        this.res.status(500).send({
            //message:Tokenexpire=Object.assign({},{"status":"Tokenexpire. Invalid"})
            message:"Token Invalid"

        })

     }//else


  }//generate_token

}//class
module.exports=Get_product;

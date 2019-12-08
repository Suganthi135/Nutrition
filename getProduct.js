

class Get_product{
  constructor(token,dbo,res,test_token){
    this.token=token;
    this.dbo=dbo;
    this.res=res;
    this.test_token=test_token;

  }
  read_mongodb(){
    var a=this.dbo
    function callback_mangdodb(a,callback){
      a.collection("Productcollection").find({"isdeleted":"NO"}).toArray(function(err, result) {
          if (err) throw err;
          console.log("result",result)

      });
      console.log("callback statrted")
      callback();

    }

    function read_completed(){
      console.log('Finished my homework');
    }
    callback_mangdodb(a,read_completed)


  }
 generate_token(){

      if (this.test_token!='passed'){
            try{
                  this.read_mongodb()
                  this.res.send({'message':'valid'})

            }catch(err){
              console.log(err)
              this.res.status(500).send({

                  message:err=Object.assign({},{"status":"Something went wrong..."})
              })

            }
      }else{
        this.res.status(500).send({
            //message:Tokenexpire=Object.assign({},{"status":"Tokenexpire. Invalid"})
            message:"Token Invalid"

        })

     }//else


  }//generate_token
}//class
module.exports=Get_product;

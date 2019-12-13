from flask import Flask,request,jsonify
app = Flask(__name__)
@app.route('/json',methods=['GET'])
def uploadfile():
      req_data = request.get_json()
      return req_data

app.run(debug=True,host="127.0.0.1", port=8000)
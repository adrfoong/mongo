var fs = require('fs');
var http = require('http');
var url = require('url');
var readline = require('readline');
var ROOT_DIR = "html/";
http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true, false);




    if(urlObj.pathname.indexOf("comments") != -1){
        console.log("comment route");
        if(req.method === "POST"){
            console.log("POST comment route");
            var jsonData = "";
            req.on('data', function(chunk){
                jsonData += chunk;
            });
            req.on('end', function(){
                var reqObj = JSON.parse(jsonData);
                console.log(reqObj);
                var MongoClient = require('mongodb').MongoClient;
                MongoClient.connect("mongodb://localhost/weather", function(err, db){
                    if(err) throw err;
                    db.collection('comments').insert(reqObj, function(err, records){
                        console.log("Record added as " + records[0]._id);
                    });
                });
            });

            res.writeHead(200);
            res.end("");
        }
        else if (req.method === "GET"){
            console.log("In GET");
            var MongoClient = require('mongodb').MongoClient;
            MongoClient.connect("mongodb://localhost/weather", function(err,db){
                if(err) throw err;
                db.collection("comments", function(err, comments){
                    if(err) throw err;
                    comments.find(function(err, items){
                        items.toArray(function(err, itemArr){
                //           	    console.log("Document Array: ");
		  //  console.log(itemArr);

                            res.writeHead(200);
                            res.end(JSON.stringify(itemArr));
                        });
                    });
                });
            });

        }

    }


    else if(urlObj.pathname.indexOf("getcity") != -1){
        var myRe = new RegExp("^"+urlObj.query["q"]);
        console.log(myRe);

        fs.readFile('html/cities.dat.txt', function (err, data) {
            if(err) throw err;
            cities = data.toString().split("\n");

            var json = [];
            for(var i = 0; i < cities.length; i++) {
                var result = cities[i].search(myRe);
                if(result != -1){

                    json.push({city: cities[i]});
                }
            }

            res.writeHead(200);
            res.end(JSON.stringify(json));
        });
    }

   else {
        fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(data);
        });
    }

}).listen(80);


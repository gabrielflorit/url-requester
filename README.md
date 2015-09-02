mongoimport --db city --collection tickets --type csv --headerline --file parking_main_file.csv --host 127.0.0.1 --port 27017
mongoimport --db city --collection routes --type csv --headerline --file routes.csv --host 127.0.0.1 --port 27017

db.tickets.update({}, {$set: {"geocode": ""}}, {upsert:false,multi:true})

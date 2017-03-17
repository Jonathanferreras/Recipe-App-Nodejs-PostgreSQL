var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser');
	cons = require('consolidate'),
	dust = require('dustjs-helpers'),
	pg = require('pg'),
	app = express();


	var config = {
  user: 'jonathan', //env var: PGUSER
  database: 'myapp-db', //env var: PGDATABASE
  password: 'jonathan', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

//dust engine
app.engine('dust', cons.dust);


//
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');


app.use(express.static(path.join(__dirname, 'public')));


//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function(req, res){

	pool.connect(function(err, client, done) {
  	if(err) {
    return console.error('error fetching client from pool', err);
  	}
  	client.query('SELECT * FROM recipes', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    res.render('index', {recipes: result.rows});
        done(err);
  });
});
});


app.post('/add', function(req, res){

	pool.connect(function(err, client, done) {
  	if(err) {
    return console.error('error fetching client from pool', err);
  	}
  	client.query("INSERT INTO recipes(name, ingredients, directions) VALUES($1, $2, $3)", 
  		[req.body.name, req.body.ingredients, req.body.directions]);
  	done();
  	res.redirect('/');
	});
});


app.delete('/delete/:id', function(req, res){

	pool.connect(function(err, client, done) {
  	if(err) {
    return console.error('error fetching client from pool', err);
  	}
  	client.query("DELETE FROM recipes WHERE id = $1", 
  		[req.params.id]);
  	done();
  	res.send(200);
	});
});



app.post('/edit', function(req, res){

		pool.connect(function(err, client, done) {
  	if(err) {
    return console.error('error fetching client from pool', err);
  	}
  	client.query("UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4", 
  		[req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
  	done();
  	res.redirect('/');
	});
});


app.listen(3000, function(){
	console.log('Server started on port 3000');
})
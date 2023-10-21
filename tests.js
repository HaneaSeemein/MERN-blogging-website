var express = require('express');
var app = express();
var PORT = 3000;

// app.use(express.json());

app.get('/', function(req, res) {
    res.render('home.ejs');
})
app.post('/', function(req, res) {
    console.log(req.body.name)
    res.end();
})
app.listen(PORT, function(err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
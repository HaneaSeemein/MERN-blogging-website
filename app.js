const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const client = new MongoClient(process.env.databaseLink);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
let loggedin = false; 
var User = null;
var postTitle = null;
// async function main(){
client.connect(()=>{
  const db = client.db('blog');
  console.log('Connected successfully to server')
  blogs = db.collection('blogs');
  users = db.collection('users');
  comments = db.collection('comments');
  posts = [];
  blogs.find().forEach(function(post){
    posts.push(post);
  })
  app.get("/", function(req, res){
    if (loggedin) {
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts
      });
    }
    else res.redirect("/login");
  });

  app.get("/about", function(req, res){
    res.render("about", {aboutContent: aboutContent});
  });
  app.get("/signup", function(req, res){
    res.render("signup");
  });
  app.get("/login", function(req, res){
    res.render("login");
  });
  app.get("/profile",function(req, res){
    res.render("profile",{User:User});
  });
  app.get("/compose",function(req, res){
    res.render("compose");
  });
app.post("/compose", function(req, res){
    blogs.insertOne({
      title: req.body.postTitle,
      content: req.body.postBody,
      picture: req.body.postPicture,
      comments: [],
      by: User.Email,
    },(post)=>posts.push(post));
    res.redirect("/");
});
app.post("/login", function(req, res){
  redirectto = "/login"
  email= req.body.email;
  password= req.body.password;
  users.findOne({Email: email}).then(function(user){ 
  if(user==null)  redirectto="/signup";
  else{
        if(password==user.Password){
          loggedin = true;
          User = user;
          console.log(User);
          redirectto = "/";
        }else{
          User=null; 
          redirectto="/signup";
            }
      }
  res.redirect(redirectto);
});})
app.post("/signup", function(req, res){

    // if (req.body.cat1==on) {
    //   profile="images/bratt.jpg";
    // }else if(req.body.cat4==on){
    //   profile="images/chonky.jpg";
    // }else if(req.body.cat2==on){
    //   profile="images/iamangry.jpg";
    // }else if(req.body.cat3==on){
    //   profile="images/pain.jpg";
    // }else if(req.body.cat5==on){
    //   profile="images/souljaboy.jpg";
    // }else if(req.body.cat6==on){
    //   profile="images/eatidcake.jpg";
    // }else if(req.body.cat7==on){
    //   profile="images/coder.jpg";
    // }

    Name = req.body.firstname+' '+req.body.lastname;
    email= req.body.email;
    pw1= req.body.password1;
    pw2= req.body.password2;
    profile = req.body.pfp;
    // users.findOne({Email: email}).then(function(user){
    //   if(user==null){
    //     if(pw1==pw2){
    //       users.insertOne({
    //         Name:Name,
    //         Email:email,
    //         Password:pw1,
    //         PfP:profile
    //     }).then((thisuser)=>{
    //     User=thisuser;
    //     loggedin= true;
    //     res.redirect("/");})
    //   }
    //   else{res.redirect("/login")}
    //   }
    // })
});
app.get("/posts/:postName", function(req, res){
  postTitle = req.params.postName;
  posts.forEach(function(post){
    const storedTitle = _.lowerCase(post.title);
    if (storedTitle === _.lowerCase(postTitle)) {
      blogs.find({"title":post.title}).forEach(function(thepost){
        res.render("post", {
          post:thepost,
        })
      });
    }
  });
});
app.post("/post", function(req, res){
  console.log("commented: "+req.body.Comment);
  console.log("in: "+postTitle);
  blogs.updateOne(
    { "title": postTitle},
    { $push: { "comments": {from:User, body: req.body.Comment} } }
).then(() =>{postTitle=null;res.redirect("/")})
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
});

{/* <button type="button " class="btn btn-outline " style="position:absolute;right:15px;border-radius:20px;background-color:white;color:gray ">
<svg xmlns="http://www.w3.org/2000/svg " width="16 " height="16 " fill="currentColor " class="bi bi-caret-up-fill " viewBox="0 0 16 16 ">
  <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z "/>
</svg>
</button> */}
{/* <input type="radio" class="btn-check" name="profile" id="option1" autocomplete="off">
<button class="profiles" for="option1" style="background-image: url('images/bratt.jpg')"></button>

<input type="radio" class="btn-check" name="profile" id="option2" autocomplete="off">
<button class="profiles" for="option1"></button>

<input type="radio" class="btn-check" name="profile" id="option3" autocomplete="off">
<button class="profiles" for="option1"><img src="images/bratt.jpg" alt="bratt" width="200px" height="200px" height:100%; width:100%;/></button>

<input type="radio" class="btn-check" name="profile" id="option4" autocomplete="off">
<button class="profiles" for="option1"><img src="images/bratt.jpg" alt="bratt" width="200px" height="200px"/></button> */}

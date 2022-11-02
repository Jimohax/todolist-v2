//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://jamie:user123@cluster0.6epyk.mongodb.net/todolistDB");

const itemsSchema = {
  name : String
};

const Item = mongoose.model(
  "Item", itemsSchema
);

const item1 = new Item ({
  name : "Welcome to your todolist"
});

const item2 = new Item ({
  name : "Hit the + button to add a new item."
});

const item3 = new Item ({
  name : "<-- Hit this to delete an item."
});


const defaultItems = [item1, item2, item3];

const routeSchema = {
  name : String ,
  items : [itemsSchema]
};

const Route = mongoose.model("Route", routeSchema);

app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){

if (foundItems.length === 0){

  Item.insertMany(defaultItems, function(err){
    if (err){
      console.log(err);
  
    }else {
      console.log("Successfully saved default items to DB.");
    }
  });
  res.redirect("/");
}else {
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}
  
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const routeName = req.body.list;

  const item = new Item ({
    name : itemName
  });

if(routeName === "Today"){
  item.save();

  res.redirect("/");
} else {
  Route.findOne({name: routeName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + routeName);
  });
}

 
});

app.post("/delete", function(req, res){
  const checkedId = req.body.checkbox;
  const routeName = req.body.routeName;

  if(routeName === "Today"){

    Item.findByIdAndRemove( checkedId, function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/");
      } 
      
    });
  }else{
    Route.findOneAndUpdate({name: routeName}, {$pull: {items: {_id: checkedId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + routeName);
      }
    });
  }

  
});

app.get("/:newRoute", function(req, res){
  const routeName = _.capitalize(req.params.newRoute);
  
  Route.findOne({name:routeName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //creating a new route
        const route = new Route({
          name: routeName,
          item: defaultItems
        });
      
        route.save();
        res.redirect("/" + routeName);
      }else{
        //render route
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://manijangid:maMAmaMA@cluster0.pket8.mongodb.net/todolistDB?retryWrites=true&w=majority",{ useNewUrlParser: true,  useUnifiedTopology: true});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));

// let today = new Date();

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to TO-DO-List"
});

const item2 = new Item({
  name : "Click + to Add new Item"
});

const item3 = new Item({
  name : "<-- Click this to remove item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items : [itemsSchema]
});

const List = mongoose.model("List",listSchema);

// http://localhost:3000/

app.get("/", function(req, res){

  Item.find(function(err, items){
    if(items.length ===0){
      Item.insertMany(defaultItems)
      items = defaultItems;
    }
    res.render("list", { listTitle : "Today", newItemsAdd : items});
  });

  // let options = {
  //   day : "numeric",
  //   weekday :"long",
  //   month : "long"
  // }
  // let date = today.toLocaleString("en-US", options);

});


// localhost:3000/work
app.get('/:userId', function (req, res) {

    const title = _.capitalize(req.params.userId);

    List.find({name:title}, function(err, itemCollection){

      if(err){
        console.log(err);
      }else{
        if(itemCollection.length>0){
            const items = itemCollection[0].items;
            res.render("list",{ listTitle: title, newItemsAdd:items});
        }else{
          const newList = new List({
            name : title,
            items : defaultItems
          });
          List.insertMany([newList]);
          res.render("list",{ listTitle: title, newItemsAdd:defaultItems});
        }
      }
    });

});

app.post("/", function(req, res){
  let item = req.body.newItem;
  const listName = req.body.list;


  if(item !== ""){

    if(req.body.list === "Today" ){
      // insert new item in database in today list
      const newListItem = new Item({
        name : item
      });
        Item.insertMany([newListItem]);
        res.redirect("/");
    }else{

        List.find({name:listName}, function(err, foundItem){
          if(err){
            console.log(err);
          }else{
            const newListItem = new Item({
              name : item
            });
            foundItem[0].items.push(newListItem);
            foundItem[0].save();
            res.redirect("/"+listName);
          }
        });

    }
  }
});


app.post("/delete", function(req, res){
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(itemId);

  if(listName === "Today"){
    Item.deleteOne({_id: itemId},function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{ $pull : {items: {_id:itemId}}},function(err,foundList){
      if(!err){
        console.log("Done!");
        res.redirect("/"+listName);
      }
    });

  }
});

app.listen(3000, function(){
  console.log("Server started on 3000");
});

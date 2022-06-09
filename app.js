//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//to connect to the local database
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

//item listSchema
const itemsSchema={
  name:String
};
//item mongoose model
const Item=mongoose.model("Item",itemsSchema);




//Item1
const item1=new Item({
  name:"Welcome to your todo list!"
});
//Item 2
const item2=new Item({
  name:"Hit the + button to add a new item."
});

//Item3
const item3=new Item({
  name:"<-- Hit this to delete an item."
});

//Default Items
const defaultItems=[item1,item2,item3];

// To store list name from user for other works
const listSchema = {
  name:String,
  items:[itemsSchema]
};
const List = mongoose.model("List",listSchema);






app.get("/", function(req, res) {

//to find all of the items
Item.find({},function(err,foundItems) //find all
{
  //display the default items
  //so that it will add default item only when length=0
  if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("successfully added!");
      }
    });

//to just redirect to home page which will in turn add default items
    res.redirect("/");

  }

  else{

res.render("list", {listTitle: "Today", newListItems: foundItems});
}
});


});

//--------------------------------------------------------------save------------------------------------

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
//creating each time after getting passed over
  const item=new Item({
    name:itemName
  })
  if(listName==="Today"){
 item.save();
 res.redirect("/");

}
//for changing heading
else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});

// ----------------------------------------------------------------------------------------Delete---------------------------------------------
app.post("/delete",function(req,res){

const checkedItemID=req.body.checkbox;

const listName=req.body.listName;

if(listName==="Today"){

  Item.findByIdAndRemove(checkedItemID,function(err){
    if(!err){
      console.log("Successfully Deleted Item");
      res.redirect("/");
    }
    });
  }
  //to redirect to listname page rather than home page  ..find one and update to delete only those which has been clicked
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},function(err,foundList){
      if(!err)
      res.redirect("/"+listName);
    });
  }



});

// For custom list
app.get("/:customListName", function(req,res){
  
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList){
        //create a new list;
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        //show an existing list
      }

    }
  });

});




app.listen(3000, function() {
  console.log("Server has started successfully");
});

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:test1234@cluster0.uzmfuja.mongodb.net/todolistDB",{
	useUnifiedTopology: true,
	useNewUrlParser: true
});

const itemSchema=mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Welcome to your todolist!"
});
const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name:"<-- Hit this to delete an item. "
});
const defaultItems=[item1,item2,item3];

const listSchema=mongoose.Schema({
  name:String,
  items:[itemSchema]
});
const List =mongoose.model("List",listSchema);



app.get("/", async function(req, res) {
  
  try {
    const items=await Item.find();
    if(items.length===0){
    await Item.insertMany(defaultItems);
    res.redirect("/");
  }else{
         res.render("list", {listTitle: "Today", newListItems:items});  
       }
  
  } catch (error) {
    
  }

  
});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
      item.save();
    res.redirect("/");
  }else{
    try {
      const foundList=await List.findOne({name:listName}).exec();
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    } catch (error) {
      
    }
  }


});

app.post("/delete",async function(req,res){
   const checkedIemId = req.body.checkbox;
   const listName=req.body.listname;

  //deleteOne(req.body.checkbox);
  if(listName==="Today"){
    try {
     await Item.findByIdAndRemove(checkedIemId);
    } catch (error) {
      
    } 

    res.redirect("/");
  }else{
    try {
      await   List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedIemId}}});

        res.redirect("/"+listName);
      
    } catch (error) {
      
    }
  }

});

app.get("/:paramName",async function(req,res){
    const customListName =_.capitalize(req.params.paramName) ; 
      try {
      const foundList = await List.findOne({ name: customListName }).exec();
      if (!foundList) {
            const list=new List({
            name:customListName,
            items: defaultItems
            });
         list.save();
            res.redirect("/"+customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
      }
    } catch (err) {
      // handle error
    }

     

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// my modules 
const bodyParser = require("body-parser");
const express = require("express");
const ejs = require('ejs');
const mongoose = require("mongoose")
const _ = require("lodash")
let myItems = [];

// create the express app
const app = express()
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs');
// create our database
mongoose.connect("mongodb+srv://ToDo:Test123@cluster0.6jwl4ly.mongodb.net/ToDoList?retryWrites=true&w=majority")
//create the item schema
const itemsSchema = {
    name:String
}
const Item = mongoose.model("item",itemsSchema)

app.get("/",async function(req,res){
    // getting the date
    let today = new Date();
    let currentDay = today.toDateString()
    // getting all the items in my database
    const items_all = await Item.find({})
    myItems = items_all
    res.render('app', {me: currentDay,items:myItems});
})
// custom get response using express routes to make new lists
const listSchema = {
    name:String,
    my_items: [itemsSchema]
} 
const List = mongoose.model("list",listSchema)
app.get("/:customListName",async function(req,res){
    const newListName = _.capitalize(req.params.customListName)
    const checkList=await List.findOne({name:newListName}).exec()
    if(checkList===null){
        const list = new List({
            name: newListName,
            my_items:[]
        }) 
        list.save()
        res.render('app', {me: newListName,items:list.my_items})
    }else{
        res.render('app', {me: newListName,items:checkList.my_items});
    }
    

})
//"mongodb+srv://ToDo:N0faEOY3lBDS0j93@todo.u23ucgd.mongodb.net/?retryWrites=true&w=majority"
// post method
app.post("/",async function(req,res){
    let item  = req.body.newItem;
    let my_custom_list = req.body.myList
    if(item.length>0){
    const new_item= new Item({
        name:item
    })

    if(isNaN(Date.parse(my_custom_list))){
            //create documents
            const my_current_list=await List.findOne({name:my_custom_list}).exec()
            my_current_list.my_items.push(new_item)
            my_current_list.save()
            res.redirect("/"+my_custom_list)        
    }else{
            //create documents
            new_item.save()
            res.redirect("/") 
        }
    }
})
// post method to delete the checked items using checkboxes

app.post("/delete",async function(req,res){
    const checkedItemId = req.body.checkbox
    const my_custom_list = req.body.mydeleteList

    if(isNaN(Date.parse(my_custom_list))){
        await List.findOneAndUpdate({name:my_custom_list},{$pull:{my_items:{_id:checkedItemId}}})
        res.redirect("/"+my_custom_list)
    }else{
        await Item.findByIdAndRemove(checkedItemId)
        res.redirect("/")
    }
    
})
// listen to my app port
port = process.env.PORT || 4500
app.listen(port,function(){
    console.log("Our server is started: "+port)
})
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const _ = require('lodash')

const date = require('./date.js')

const app =  express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("./v2/public"))

// Setting view engine
app.set('view engine', 'ejs');
app.set('views', './v2/views');


mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsScheme = new mongoose.Schema({
    name: String,
})

const Item = mongoose.model('item',itemsScheme)

const item0 = new Item({name:"TEst"})
const item1 = new Item({name:"TEst1"})
const item2 = new Item({name:"TEst2"})

const listScheme = {
    name: String,
    items: [itemsScheme]
}
const List = mongoose.model('list',listScheme)

const defaultItems = [ item0,item1,item2]

app.post("/", function(req, res){
    const item_name = req.body['new-item']
    const list_name = req.body['list-name']
    const item = new Item({name:item_name})
    
    if(list_name == date.getDay()){
        item.save()
        res.redirect('/')
        
        // work_items.push(parsed_res);
    }else{
        List.findOne({name: list_name})
        .then(found_list=>{
            found_list.items.push(item)
            found_list.save()
            res.redirect(`/lists/${list_name}`)
            
        })
        .catch(err=>console.log('Insert failed: ',err))
    }
})

app.get("/", function(req, res){ 
    Item.find()
    .then(found_items=>{
        console.log('Find Successful: ',found_items)
        if(found_items.length === 0){
            Item.insertMany(defaultItems)
            .then(res_=>{
                res.redirect('/')
                console.log('Insert Successful: ',res_)}) // Info this still print after redirect method
            .catch(err=>console.log('Insert failed: ',err))
        }
        else{
            res.render("list", {list_title: date.getDay(), list_items: found_items})
        }
    })
    .catch(err=>console.log('Insert failed: ',err))


})

app.get('/work', function(req,res){
    res.render('list', {list_title: "Work List", list_items: work_items})
})
app.get('/about',function(req, res){
    res.render("about")
})

app.get('/lists/:list',function(req, res){

    const custom_list_name = _.capitalize(req.params.list)
    List.findOne({name: custom_list_name})
    .then(res_=>{
        if(res_){
            res.render("list", {list_title: res_.name, list_items: res_.items})
        }else{
            console.log("Doesn't Exit")
            const list = new List({
                name:custom_list_name,
                items:defaultItems
            })
            list.save()
            res.redirect(`/lists/${custom_list_name}`)
        }
    })
    .catch(err=>console.log('Find1 failed: ',err))
    



    // res.render("about")
})

app.post("/delete", function(req, res){
    const checked_item_id = req.body['checkbox']
    const list_name = req.body['list-name']
    // console.log(list_name,checked_item_id)
    // return
    if(list_name == date.getDay()){
        Item.findByIdAndDelete(checked_item_id)
        .then(res_=>{
            res.redirect('/')
            console.log('Delete Successful: ',res_)})
        .catch(err=>console.log('Delete failed: ',err))
    }else{
        List.findOneAndUpdate({name: list_name},{$pull: {items: {_id: checked_item_id}} })
        .then(res_=>{
            res.redirect('/lists/'+list_name)
            console.log('Delete Successful: ',res_)})
        .catch(err=>console.log('Delete failed: ',err))
    }
    
})


app.listen(3000, function(){
    console.log("Server started on port 3000")
    
})

//jshint esversion:6

const express = require("express")
const bodyParser = require("body-parser")
const port = 3000
const app = express()
//const date = require(__dirname + "/date.js")
const mongoose = require('mongoose')
const _ = require('lodash')

//const items = ['Learning', 'Drinking', 'Working', 'Screaming']
//const workItems = []

//Database
mongoose.connect('mongodb+srv://dandan-admin:Test123$@cluster0.hbuah.mongodb.net/todolistDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

const Item = mongoose.model('Item', itemsSchema);
const item1 = new Item({
  name: 'Learning'
})
const item2 = new Item({
  name: 'Working'
})
const item3 = new Item({
  name: 'Drinking'
})
const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);


// App requests
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static('public'))

app.get('/', (req, res) => {
  //  const day = date.getDate();
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved all the items to todolistDB!")
        }
      })
      res.redirect('/')
    } else {
      res.render('list', {
        listTitle: 'Today',
        newListItems: foundItems
      })
    }
  })

})

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect('/' + customListName)
        //
      } else {
        // show  an exisitng list-foundlist
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })
})


app.post('/', (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === 'Today') {
    item.save();
    res.redirect('/')
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    })
  }

})


app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, function(err) {
        if (!err) {
          res.redirect('/')
        }
      });
      } else {
        List.findOneAndUpdate({
          name: listName
        }, {
          $pull: {
            items: {
              _id: checkedItemId
            }
          }
        }, function(err, foundList) {
          if (!err) {
            res.redirect('/' + listName)
          }
        })
      }
    })

//  app.get('/localhost:3000/home', (req,res)=> {
//    req.params.home
//  })

/*

  if (req.body.list === "Work") {
    workItems.push(item)
    res.redirect('/work')
  } else {
    items.push(item)
    res.redirect('/')
  }

app.get('/work', (req,res) => {

  res.render ('list', {listTitle: "Work List ", newListItems: workItems})
})
*/


app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

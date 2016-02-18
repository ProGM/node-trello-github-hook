var uuid = require('node-uuid'),
process = require('process'),
fs = require('fs'),
bodyParser = require('body-parser');

var express = require('express');
var app = express();
app.use(bodyParser.json());

if ( app.get('env') === 'development' ) {
  var dotenv = require('dotenv');
  if (dotenv) { dotenv.config(); }
}

var Trello = require("node-trello");
var t = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);

app.post('/github_hook', function(req, res) {

  if (req.body.action == 'opened') {
    console.log("PROCESSING OPENED TRIGGER");
    var issue_name = req.body.issue.title;
    var card_id = issue_name.match(/\[[a-zA-Z0-9]+\]/)[0].replace('[', '').replace(']', '');
    var issue_url = req.body.issue.html_url;
    console.log("Issue Name:", issue_name);
    console.log("Card id:", card_id);
    t.get('/1/cards/' + card_id + '/checklists', function(err, data) {
      if (err) {
        res.status(err.statusCode).send(err.body);
        return;
      }
      // Se esiste una checklist aggiungi l'elemento
      if (data[0] != undefined) {
        var checklist_id = data[0].id;
        console.log("FOUND CHECKLIST WITH ID: " + checklist_id);

        t.post('/1/cards/' + card_id + '/checklist/' + checklist_id + '/checkItem', { name: issue_name + " " + issue_url }, function(err, data) {
          if (err) {
            console.log("ERROR ON CREATING CHECKLIST ITEM:");
            console.log(err);
            res.status(err.statusCode).send(err.body);
          } else {
            console.log("CHECKLIST ITEM CREATED!");
            console.log(data);
            res.send("OK");
          }
        });
      } else {
        // Altrimenti creala!
        console.log("CHECKLIST NOT FOUND, CREATING...");
        t.post('/1/cards/' + card_id + '/checklists', { name: 'Github Issues:' }, function(err, data) {
          var checklist_id = data.id;
          if (err) {
            res.status(err.statusCode).send(err.body);
          } else {
            t.post('/1/cards/' + card_id + '/checklist/' + checklist_id + '/checkItem', { name: issue_name + " " + issue_url }, function(err, data) {
              if (err) {
                console.log("ERROR ON CREATING CHECKLIST ITEM:");
                console.log(err);
                res.status(err.statusCode).send(err.body);
              } else {
                console.log("CHECKLIST ITEM CREATED!");
                console.log(data);
                res.send("OK");
              }
            });
          }
        });
      }
    });
  } else if (req.body.action == 'closed') {
    console.log("PROCESSING OPENED TRIGGER");
    var issue_name = req.body.issue.title;
    var card_id = issue_name.match(/\[[a-zA-Z0-9]+\]/)[0].replace('[', '').replace(']', '');
    var issue_url = req.body.issue.html_url;
    console.log("Issue Name:", issue_name);
    console.log("Card id:", card_id);

    t.get('/1/cards/' + card_id + '/checklists', function(err, data) {
      // Se esiste una checklist aggiungi l'elemento
      if (data[0] != undefined) {
        console.log('checklist exists');
        var checklist_id = data[0].id;
        var checkitems = data[0].checkItems;
        console.log(data[0].checkItems)
        var checkitem = null;
        for (var i = 0; i < data[0].checkItems.length; i++) {
          if (checkitems[i].name == (issue_name + " " + issue_url)) {
            checkitem = checkitems[i].id;
            break;
          }
        }
        if (checkitem == null) {
          res.send('Ignored');
          return;
        }
        t.put('/1/cards/' + card_id + '/checklist/' + checklist_id + '/checkItem/' + checkitem, { state: 'complete' }, function(err, data) {
          if (err) {
            console.log("ERROR WHEN SETTING ITEM COMPLETED");
            console.log(err);
            res.status(err.statusCode).send(err.body);
          } else {
            console.log("CHECKLIST ITEM SET TO COMPLETE STATUS!");
            console.log(data);
            res.send("OK");
          }
        });
      } else {
        res.send('Ignored');
      }
    });
  } else {
    res.send('Ignored');
  }
});

app.listen(process.env.PORT || 8000);

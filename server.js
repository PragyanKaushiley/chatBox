var express = require('express');
var bodyParser = require('body-parser'),
    app = express.createServer(express.logger()),
    io = require('socket.io').listen(app);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


var Message = mongoose.model('Message', {
  name: String,
  message: String
});

//Database connection
var dbUrl = "mongodb://Pragyan:Pragyan97@ds135796.mlab.com:35796/chatbox";

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({
    name: user
  }, (err, messages) => {
    res.send(messages);
  });
});


app.post('/messages', async (req, res) => {
  try {
    var message = new Message(req.body);

    var savedMessage = await message.save()
    console.log('saved');

    var censored = await Message.findOne({
      message: 'badword'
    });
    if (censored)
      await Message.remove({
        _id: censored.id
      })
    else
      io.emit('message', req.body);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.log('error', error);
  } finally {
    console.log('Message Posted')
  }
});

io.on('connection', function (socket) {
  io.sockets.emit('status', { status: status }); // note the use of io.sockets to emit but socket.on to listen
  socket.on('reset', function (data) {
    status = "War is imminent!";
    io.sockets.emit('status', { status: status });
  });
});

mongoose.connect(dbUrl, {
  useNewUrlParser: true
}, (err) => {
  console.log('mongodb connected', err);
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Starting on ${port}`);
});

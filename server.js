const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// connet to mongo
mongo.connect('mongodb://127.0.0.1/buntchat', { useNewUrlParser: true }, function (err, database) {
    if (err) {
        throw err;
    }
    let db = database.db('buntchat');

    console.log('MongDB connected...')

    // Connect to Socket.io
    client.on('connection', function (socket) {

        let chat = db.collection('chats');
        // Create function to send status
        sendStatus = function (s) {
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
            if (err) {
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        // Hnadle input events
        socket.on('input', function (data) {
            let name = data.name;
            let message = data.message;

            // Check for name and message(if empty)
            if (name == '' || message == '') {
                sendStatus('Please enter a name and message');
            } else {
                // insert message
                chat.insert({ name: name, message: message }, function () {
                    client.emit('output', [data]);

                    // Sen status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // Handle clear
        socket.on('clear', function (data) {
            // Remove all cahts from collection
            chat.remove({}, function () {
                // Emit cleared
                socket.emit('cleared');
            });
        });
    });
});
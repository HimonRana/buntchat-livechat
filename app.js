(function () {
    var element = function (id) {
        return document.getElementById(id);
    }

    // Get elements
    var status = element('status');
    var messages = element('messages');
    var textarea = element('textarea');
    var username = element('username');
    var clearBtn = element('clear');

    // Set default status
    var statusDefault = status.textContent;

    var setStatus = function (s) {
        // Set status
        status.textContent = s;

        if (s !== statusDefault) {
            var delay = setTimeout(function () {
                setStatus(statusDefault);
            }, 2000);
        }
    }

    // Connect to Socket.io
    var socket = io.connect('http://127.0.0.1:4000');

    // Check for Socket connection
    if (socket !== undefined) {
        console.log('Connected to socket...')

        // Handle message output
        socket.on('output', function (data) {
            // console.log(data)
            if (data.length) {
                for (var i = 0; i < data.length; i++) {
                    // Build message div
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[i].name + ": " + data[i].message;
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);

                }
            }
        });

        // Get status from server
        socket.on('status', function (data) {
            // Get message status
            setStatus((typeof data === 'object') ? data.message : data);
            
            // If status is clear, clear text
            if (data.clear) {
                textarea.value = '';
            }
        });
        
        
        textarea.addEventListener('keypress', function (event) {
            if (event.which === 13 && event.shiftKey == false) {

                // Emit to server input
                socket.emit('input', {
                    name: username.value,
                    message: textarea.value
                });

                event.preventDefault();
            }
        });

        // Handle Chat clear
        clearBtn.addEventListener('click', function () {
            if (window.confirm("Do you really want to DELETE all?")) {
                socket.emit('clear');
            }
        });

        // Clear Message
        socket.on('cleared', function () {
            messages.textContent = '';
        });

    }

})();
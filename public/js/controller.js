var socket = io.connect('http://localhost');

/*** CLIENT -> SERVER ***/

var nextAvailableID = 0;
function nextID() {
    return nextAvailableID++;
}

function sendError(context, message) {
    context.send({ "type": "error", "message": message});
}

function parseInput(input, context) {
    var parts = input.split(' ');

    var command, directive;
    if(message[0] === '/') { // If it's a command
        switch(parts[0]) {
            case '/connect':
                command = 'irc.connect';

                if(parts.length < 4) {
                    sendError(context, "Missing arguments to /connect");
                    return;
                }

                if(context.type == '') { // Use this context for the connection
                    context.connectionID = nextID();
                } else { // Create a new context for this connection
                    context = new Context();
                    context.connectionID = nextID();
                }

                // TODO: parts[4+] are channels, auto-join those

                directive = {
                    server: parts[1],
                    port: parts[2],
                    nick: parts[3]
                };

                break;

            case '/join':
                command = 'irc.join';

                if(parts.length < 2) {
                    sendError(context, "Missing argument to /join");
                    return;
                }

                // Make sure we have a connection
                if(! ('connectionID' in context)) {
                    sendError("You haven't connected to any server yet. Try /connect-ing to one first.");
                    return;
                }

                directive = {
                    channel: parts[1]
                };

                if(context.type == '') { // Use this context for the channel
                    context.type = 'channel';
                } else { // Set up a new context and tab for this channel
                    var newContext = new Context('channel');
                    newContext.connectionID = context.connectionID;
                    context = newContext;
                }

                // Remember the channel we're joining
                context.channel = directive.channel;
                // FIXME: We've automatically assumed that the connection succeeded. Bad assumption.

                break;

            case '/msg':
                command = 'irc.message';

                if(parts.length < 3) {
                    sendError(context, "Missing arguments to /msg");
                    return;
                }

                // Make sure we have a connection
                if(! ('connectionID' in context)) {
                    sendError("You haven't connected to any server yet. Try /connect-ing to one first.");
                    return;
                }

                directive = {
                    type: 'say',
                    target: parts[1],
                    message: parts.slice(2).join(' ')
                };

                if(context.type == '') { // Use this context for the conversation
                    context.type = 'pm';
                } else { // Set up a new context and tab for this conversation
                    var newContext = new Context('pm');
                    newContext.connectionID = context.connectionID;
                    context = newContext;
                }

                break;
            case '/me':
                // Make sure we're connected to a channel
                if(! ('channel' in context)) {
                    sendError(context, "You're not in any channel yet. Try /join-ing one.");
                    return;
                }

                directive = {
                    type: 'action',
                    target: context.channel,
                    message: parts.slice(1).join(' ')
                };

                break;

            case '/whois':
                sendError(context, 'TODO');
                return;

            case '/list':
                sendError(context, 'TODO');
                return;

            default:
                sendError(context, "Unrecognized command");
                // TODO: send it to the server anyway?
                return;
        }
    } else { // Treat it as a message to the channel
        command = 'irc.message';

        // Make sure we're connected to a channel
        if(! ('channel' in context)) {
            sendError(context, "You're not in any channel yet. Try /join-ing one.");
            return;
        }

        directive = {
            type: 'say',
            target: context.channel,
            message: input
        };
    }

    // Attach the connection's unique ID to the directive
    directive.id = context.connectionID;

    socket.emit(command, directive);
}

listen(parseInput);


/*** SERVER -> CLIENT ***/


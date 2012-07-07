ircel
=====

Protocol
--------
### Client -> Server

    connect: 
    {
        server: <host>,
        port: <port>,
        nick: <nick>,
        channel: [<channel>, ...] | []
    }, function(id) {
        this.connectionID = id;
    }

    join: 
    {
        id: <id>,
        channel: <channel>
    }

    message: 
    {
        id: <id>,
        type: "say" | "ctcp" | "action" | "notice"
        target: <target>,
        message: <message>
    }

    whois: 
    {
        id: <id>,
        nick: <nick>
    }

    list: // lists rooms
    {
        id: <id>,
        args: [<arg>, ...] | []
    }

TODO: how do we handle unknown commands?? (e.g., /blah)

### Server -> Client

    message:
    {
        id: <id>, // connnection
        type: "message" | "notice" | "privmsg"
        from: <from>,
        to: ...,
        message: ...
    }

    event:
    {
        id: <id>,
        type: "join" | "part"
        channel: ...,
        nick: ...
    }


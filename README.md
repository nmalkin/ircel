ircel
=====

Protocol
--------
### Client -> Server

    irc.connect: 
    {
        id: <id>, // a unique identifier for this connection
        server: <host>,
        port: <port>,
        nick: <nick>,
        channels: [<channel>, ...] | []
    }

    irc.join: 
    {
        id: <id>,
        channel: <channel>
    }

    irc.message: 
    {
        id: <id>,
        type: "say" | "ctcp" | "action" | "notice"
        target: <target>,
        message: <message>
    }

    irc.whois: 
    {
        id: <id>,
        nick: <nick>
    }

    irc.list: // lists rooms
    {
        id: <id>,
        args: [<arg>, ...] | []
    }

TODO: how do we handle unknown commands?? (e.g., /blah)

### Server -> Client

    irc.message:
    {
        id: <id>, // connnection
        type: "message" | "notice" | "privmsg"
        from: <from>,
        to: ...,
        message: ...
    }

    irc.event:
    {
        id: <id>,
        type: "join" | "part"
        channel: ...,
        nick: ...
    }
    
    irc.whois:
    {
        id: <id>,
        nick: ...,
        info: // http://node-irc.readthedocs.org/en/latest/API.html#%27whois%27
    }
    
    irc.list:
    {
        id: <id>,
        list: [...]
    }

### Client

#### Controller

- communicates with the server (using API defined above)
- calls UI function `listen` with callback that will be invoked on user input
    - `callback(message, currentContext)`
- calls `Context.send` with `message` when it wants something displayed
    - `send({
        type: "message" | "action" | "whois" | "names" | ...,
        contents: String | Array | Object
    })`
- creates `new Context` and calls `addTab` with it when necessary  
    (e.g., when joining new channels)

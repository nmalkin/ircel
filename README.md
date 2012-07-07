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
        channel: [<channel>, ...] | []
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

### Client

#### Controller

- communicates with the server (using API defined above)
- calls UI function `listen` with callback that will be invoked on user input
    - `listen(message, currentContext)`
- calls `Context.send` with `message` when it wants something displayed
- creates `new Context` and calls `addTab` with it when necessary  
    (e.g., when joining new channels)
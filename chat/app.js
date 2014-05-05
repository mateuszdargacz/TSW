var express = require("express");
var _ = require("underscore");
var app = express();
var SHA = require("./utils/sha256");
var httpServer = require("http").createServer(app);

var socketio = require("socket.io");
var io = socketio.listen(httpServer);

app.use(express.static("public"));
app.use(express.static("bower_components"));

var random_string = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 256; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};
var delElem = function (room, usr) {
    return _.reject(room.users, function (item) {
        return item === usr;
    });
};
var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

var replaceTag = function (tag) {
    return tagsToReplace[tag] || tag;
};
var safe_tags_replace = function (str) {
    return str.replace(/[&<>]/g, replaceTag);
};
//models
var User = function (name) {
    this.name = name;
    this.token = SHA(name);
    this.socket_id = undefined;
};
var Room = function (name, creator) {
    this.name = name;
    this.users = [];
    this.creator = creator;

};
var Msg = function (user, text, room) {
    this.user = user;
    this.date = new Date();
    this.text = text;
    this.room = room;
};
var users = [];
var history = [];
var rooms = [];
//TODO DELETE INITIAL DAREK
users.unshift(new User("darek"));
var getUser = function (token, id) {
    var usr = _.find(users, function (obj) {
        return obj.token === token
    });

    if (usr) {
        usr.socket_id = id;
    }
    return usr;
};

var getRoom = function (roomName) {
    return _.find(rooms, function (obj) {
        return obj.name === roomName;
    });
};
var createRoom = function(roomName, creator){
    var room = undefined;
    if (!getRoom(roomName)){
        room = new Room(roomName, creator);
        rooms.unshift(room)
    }
    return room
};
var getUserInRoom = function (roomName, usrToken) {
    var room = getRoom(roomName);
    if(room){
        return _.find(room.users, function (obj) {
            if (obj){
                return obj.token === usrToken;
            }
            return true
    });
    return false
    }
};
var addUserInRoom = function (room, usrToken, socketId) {
    if (!getUserInRoom(room.name, usrToken)) {
        room.users.unshift(getUser(usrToken, socketId));
        return true
    }
    else return false;
};

var delUserInRoom = function (roomName, usrToken, socketId) {
    var usr = getUserInRoom(roomName, usrToken);
    if (usr) {
        var room = getRoom(roomName);
        delElem(room, usr);
        room.users.unshift(getUser(usrToken, socketId));
        return true
    }
    else return false;
};
//END models
//initial room
createRoom('Pozczekalnia', new User("Admin"));
io.sockets.on('connection', function (socket) {
    //    HANDLE User
    socket.on('change create user', function (data) {
        // if not session, then use socket.set('nickname', "Earl"); instead of model
        var usr = undefined;
        if (data.token) {
            usr = getUser(data.token, socket.id);
            usr.name = data.name;
        } else {
            usr = new User(data.name);
            users.unshift(usr);
            usr.socket_id = socket.id;
        }

        socket.emit('rec user', {
            user: usr,
            rooms: rooms
        });
    });
    socket.on('get user', function (token) {
        socket.emit('rec user', {
            user: getUser(token, socket.id),
            rooms: rooms
        });
    });
    //END HANDLE User

    //    Handle Rooms

    socket.on('append room', function (data) {
        var room = getRoom(data.roomName);
        if (room) {
            //  TODO find proper way to handle messages
            socket.emit('room error',  true);
            setTimeout(function () {
                socket.emit('room error', false);
            }, 1000);

        } else {
            room = new Room(data.roomName, getUser(data.token, socket.id));
            rooms.unshift(room);
            socket.join(room.name);
            io.sockets.emit('update rooms', rooms);
        }

    });

    socket.on('enter room', function (data) {
        if (!_.find(io.sockets.clients(data.roomName), function(obj){return obj.id === socket.id })){
            socket.join(data.roomName);
            if (addUserInRoom(getRoom(data.roomName),data.token, socket.id))
                io.sockets.emit('update rooms', rooms);
        }

//
    });
    socket.on('leave room', function (data) {
        socket.leave(data.roomName);
        delUserInRoom(getRoom(data.roomName));
        io.sockets.emit('update rooms', rooms);
    });
    socket.on('create msg', function (data) {
        //        TODO emit msg
    });
    socket.on('send msg', function (msg) {
        var mess = new Msg(msg.user, safe_tags_replace(msg.text), msg.room);
        history.unshift(mess);
        io.sockets.emit('rec msg', mess);
    });
    socket.on('join room', function (data) {
        //        TODO emit msg
    });
    socket.on('leave room', function (data) {
        //        TODO emit msg
    });
    socket.on('add room', function (data) {

        if (rooms.indexOf(data) < 0) {
            rooms.unshift(data);
            io.sockets.emit('update rooms', data);
        }
    });


    socket.emit('history', history);
});
httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na pocie 3000');
});

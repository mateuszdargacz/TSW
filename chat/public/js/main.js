var app = angular.module('czatApka', ['ngCookies']);

app.factory('_', function () {
    return window._;
});
app.factory('$', function () {
    return window.jQuery;
});
app.factory('cook', function () {
    return window.$.cookie;
});
app.factory('delcook', function () {
    return window.$.removeCookie;
});
app.factory('socket', function () {
    return io.connect('http://' + location.host);
});

app.filter('unique', function () {
    return function (input, key) {
        var unique = {};
        var uniqueList = [];
        if (input)
            for (var i = 0; i < input.length; i++) {
                if (typeof unique[input[i][key]] == "undefined") {
                    unique[input[i][key]] = "";
                    uniqueList.push(input[i]);
                }
            }
        return uniqueList;
    };
});

app.filter('activeRoomMsg', function () {
    return function (input, room) {
        var roomMsgs = [];
        for (var i = 0; i < input.length; i++) {
                if (input[i].room.name === room.name) {
                roomMsgs.unshift(input[i]);
            }
        }
        return roomMsgs
    }
});
app.filter('notOpenedRooms', function () {
    return function (input, openedRooms) {
        var opened = [];
        for (var i = 0; i < input.length; i++) {
            if (! _.find(openedRooms, function(obj){
              return  obj.name === input[i].name
            })) {
                opened.unshift(input[i]);
            }
        }
        return opened
    }
});

app.controller('chatCtrlr', ['$scope', '$cookieStore', 'socket', '_', '$', 'cook', 'delcook',
    function ($scope, $cookieStore, socket, _, $, cook, delcook) {


        //        Handle User
        var userCookieId = 'userToken';
        //        TODO REMOVE JQUERY SHIEET
        $scope.setUserCookie = function (value) {
            //          return $cookieStore.put(userCookieId,value);
            return cook(userCookieId, value);
        };
        $scope.getUserCookie = function () {
//          return $cookieStore.get(userCookieId);
            return cook(userCookieId);

        };
        $scope.removeUserCookie = function () {
//          return $cookieStore.remove(userCookieId);
            return delcook(userCookieId);
        };
        $scope.getUser = function (token) {
            socket.emit('get user', token);
        };
        $scope.changeOrCreateUser = function (name) {
            socket.emit('change create user', {
                name: name,
                token: $scope.getUserCookie()
            })

        };
        socket.on('rec user', function (data) {
            $scope.User = data.user;
            $scope.rooms = data.rooms;
            $scope.enterRoom($scope.rooms[0]);
            $scope.$digest();
            $scope.setUserCookie($scope.User.token);
        });
        //        END handle user


//        TODO DEV REMOVE
        $scope.removeUserCookie()
        //        Check if user session
//        TODO WHY doesnt work? replace by jquery
        if ($scope.getUserCookie()) {
            $scope.getUser($scope.getUserCookie())
        } else {
            $(".modal.fade").modal("toggle");
            $(".modal.fade").modal({
                backdrop: 'static',
                keyboard: false
            });
        }
        //        END Check if user session

        //        Handle Rooms
        $scope.rooms = [];
        $scope.getRoom = function (roomName) {
            return _.find($scope.rooms, function (obj) {
                return obj.name === roomName
            });
        };
        $scope.getOpenedRooms = function () {
            return _.find($scope.rooms, function (obj) {
                return obj.opened === true;
            });
        };
        $scope.getActiveRoom = function () {
            return _.find($scope.rooms, function (obj) {
                return obj.active === true;
            });
        };
        $scope.isActiveRoom = function(room){
            var active = $scope.getActiveRoom();
            if(active !== undefined && room.name === active.name)
                return 'active';
            return active
        };
        $scope.setActiveRoom = function (room) {
            var last_active = $scope.getActiveRoom();
            if (last_active)
                last_active.active = false;
            room.active = true;
            return true
        };
        $scope.appendRoom = function (roomName) {
            socket.emit('append room', {
                roomName: roomName,
                creator: $scope.User.token
            });
        };
        $scope.openedRooms = [];

        $scope.ifOpenedRoom = function (room) {
            return _.find($scope.openedRooms, function (obj) {
                return obj.name === room.name
            })
        };
        $scope.openRoom = function (room) {
            if(!$scope.ifOpenedRoom(room)){
             return $scope.openedRooms.unshift(room);
            }
            return false;
        };
        $scope.enterRoom = function (room) {
            $scope.setActiveRoom(room);
            socket.emit('enter room', {
                roomName: room.name,
                token: $scope.User.token
            });
            $scope.openRoom(room)
        };
        $scope.leaveRoom = function (room) {
            $scope.openedRooms = _.reject($scope.openedRooms, function (obj) {
                return obj.name == room.name;
            });
            if ($scope.openedRooms[0]) $scope.openedRooms[0].active = true;
            socket.emit('leave room', {
                roomName: room.name,
                creator: $scope.User.token
            });

        };
        socket.on('room error', function (data) {
            $scope.roomError = data;
            $scope.$digest();
        });
        socket.on('update rooms', function (rooms) {
            for (var i = 0; i < rooms.length; i++) {
                var room = undefined;
                room = $scope.getRoom(rooms[i].name);
                if (!room) {
                    $scope.rooms.unshift(rooms[i])
                }
            }
            if ($scope.rooms[0] !== null && $scope.rooms.length === 1 && !$scope.getOpenedRooms()) {
                //TODO   check if awesome
                $scope.rooms[0].active = true;
                $scope.enterRoom($scope.rooms[0]);
            }
            $scope.$digest();
        });

        // Handlw messages
        $scope.msgs = [];
        $scope.sendMSG = function(msg){
            if(msg.text){
                msg.room = $scope.getActiveRoom();
                msg.user = $scope.User;
                socket.emit('send msg', msg);

            }
        };
        $scope.sendMsg = function (msg) {
            if (msg && msg.text && msg.name && msg.room) {
                socket.emit('send msg', {
                    text: safe_tags_replace(msg.text),
                    name: safe_tags_replace(msg.name),
                    room: msg.room
                });
                msg.text = '';
            }
        };

        //        handle connection
        $scope.connected = false;
        socket.on('connect', function () {
            $scope.connected = true;
            $scope.$digest();
        });
        socket.on('history', function (data) {
            $scope.msgs = data;
            $scope.$digest();
        });

        socket.on('rec msg', function (data) {
            $scope.msgs.unshift(data);
            $scope.$digest();
        });
    }
]);

app.directive("message", function () {
    return {
        restrict: "E",
        scope: {
            send: "&"
        },
        template: '<form action="" ng-submit="send({msg:msg})"><hr class="my-hr"/><div class="col-md-5 col-md-offset-5">' +
            '<textarea data-ng-model="msg.text" class="form-control" rows="1" placeholder="Wpisz wiadomość"></textarea>' +
            '</div><div class="col-md-2">' +
            '<input class="btn btn-primary btn-sm" type="submit" value="Wyślij"/> </div>' +
            '</form>'
    }
});
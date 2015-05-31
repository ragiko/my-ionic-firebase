angular.module('mychat.services', ['firebase'])
    .factory("Auth", ["$firebaseAuth", "$rootScope",
    function ($firebaseAuth, $rootScope) {
            var ref = new Firebase(firebaseUrl);
            return $firebaseAuth(ref);
}])

.factory('Chats', function ($firebase, Rooms) {

    var selectedRoomId;

    var ref = new Firebase(firebaseUrl);
    var chats;

    return {
        all: function () {
            return chats;
        },
        remove: function (chat) {
            chats.$remove(chat).then(function (ref) {
                ref.key() === chat.$id; // true item has been removed
            });
        },
        get: function (chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        },
        // return promise object
        getSelectedRoom: function () {
            var selectedRoom;

            console.log(selectedRoomId)
            if (selectedRoomId && selectedRoomId != null) {
                return Rooms.get(selectedRoomId);
            } else
                return null;
        },
        selectRoom: function (roomId) {
            console.log("selecting the room with id: " + roomId);
            selectedRoomId = roomId;
            if (!isNaN(roomId)) {
                chats = $firebase(ref.child('rooms').child(selectedRoomId).child('chats')).$asArray();
            }
        },
        send: function (from, message) {
            console.log("sending message from :" + from.displayName + " & message is " + message);
            if (from && message) {
                var chatMessage = {
                    from: from.displayName,
                    message: message,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                };
                chats.$add(chatMessage).then(function (data) {
                    console.log("message added");
                });
            }
        }
    }
})
    

/**
 * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
 */
.factory('Rooms', function ($firebase, $FirebaseArray) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase(firebaseUrl);
    var rooms = $firebase(ref.child('rooms')).$asArray();
        
    var roomsObj = ref.child('rooms');

    return {
        all: function () {
            return rooms;
        },
        get: function (roomId) {
            // Simple index lookup
            return rooms.$loaded().then(function() {
                console.log(rooms.$getRecord(roomId));
                return rooms.$getRecord(roomId);
            }).catch(function (error) {
                return null
            });
        },
        create: function (room) {
            console.log("create room");

            ref.child('rooms').child(rooms.length+1).set({
                id: rooms.length+1,
                icon: "ion-music-note",
                name: room.name,
                notes: room.notes,
                createdAt: Firebase.ServerValue.TIMESTAMP
            });
        }
    }
});
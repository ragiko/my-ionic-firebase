angular.module('mychat.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope, $cookieStore) {
    //console.log('Login Controller Initialized');

    // var ref = new Firebase($scope.firebaseUrl);
    var ref = new Firebase("https://flickering-torch-2284.firebaseio.com");

    var auth = $firebaseAuth(ref);
        
        
        

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // selector
    $scope.sexes = [
        {name:'man'},
        {name:'woman'},
    ];
    $scope.sex = $scope.sexes[0]; // man

    $scope.createUser = function (user) {
        console.log("Create User Function called");
        if (user && user.email && user.password && user.displayname && $scope.sex) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });

            auth.$createUser({
                email: user.email,
                password: user.password
            }).then(function (userData) {
                alert("User created successfully!");
                ref.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname,
                    sex: $scope.sex.name
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }).catch(function (error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signIn = function (user) {

        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.$authWithPassword({
                email: user.email,
                password: user.pwdForLogin
            }).then(function (authData) {
                console.log("Logged in as:" + authData.uid);
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    var val = snapshot.val();
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.displayName = val;
                    });
                    
                    $cookieStore.put("userVal", val);
                });
                $ionicLoading.hide();
                $state.go('tab.rooms');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
})

.controller('ChatCtrl', function ($scope, Chats, $state, $cookieStore) {
    //console.log("Chat Controller initialized");

    $scope.IM = {
        textMessage: ""
    };
    
    // chatsを選択
    Chats.selectRoom($state.params.roomId);

    // chatsからroomNameを取得
    var roomName = Chats.getSelectedRoomName();

    // Fetching Chat Records only if a Room is Selected
    if (roomName) {
        $scope.roomName = " - " + roomName;
        $scope.chats = Chats.all();
    }

    $scope.sendMessage = function (msg) {
        var userVal = $cookieStore.get("userVal");
        if (!userVal) {
            alert("cookie is nothing")
        }
        Chats.send(userVal, msg);
        $scope.IM.textMessage = "";
    }

    $scope.remove = function (chat) {
        Chats.remove(chat);
    }
})

.controller('RoomsCtrl', function ($scope, Rooms, Chats, $state, $ionicModal) {
    //console.log("Rooms Controller initialized");
    $scope.initRoom = function () {
        return {
            name: "",
            notes: "",
            createdAt: Firebase.ServerValue.TIMESTAMP
        };
    };
        
    $scope.IM = {
        room: $scope.initRoom()
    };

    $scope.rooms = Rooms.all();

    $scope.openChatRoom = function (roomId) {
        $state.go('tab.chat', {
            roomId: roomId
        });
    }

    $scope.createRoom = function (room) {
        Rooms.create(room);
        $scope.IM.room = $scope.initRoom();
    }

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('modal.html', function ($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });
});
;jQuery(function($) {
    'use strict';

    window.requestAnimationFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(callback,  element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    var IO = {
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        bindEvents: function() {
            IO.socket.on('connected', IO.onConnected);
            IO.socket.on('newGameCreated', IO.onNewGameCreated);
            IO.socket.on('buildedGame', IO.onBuildedGame);

            IO.socket.on('gameList', IO.onGameList);

            IO.socket.on('playerJoinedGame', IO.onPlayerJoinedGame);

            IO.socket.on('playerRuned', IO.onPlayerRuned);
            IO.socket.on('playerStoped', IO.onPlayerStoped);

        },

        onConnected: function(data) {
            App.mySocketId = IO.socket.socket.sessionid;
        },

        onNewGameCreated: function(data) {
            console.log('create');
            App.Host.gameInit(data);
        },

        onBuildedGame: function(data) {
            App.players = data.players;
            App.playerActive = data.playerActive;

            App.$gameArea.html( App.$gameFieldTemplate );
            App.drawingLevel();

            App.Player.createPlayer( App.players[App.mySocketId] );

            App.Player.createStatisticPlayer({ num: data.playerActive,
                                                playerName: App.players[App.mySocketId].playerName,
                                                kill: App.players[App.mySocketId].kill,
                                                dead: App.players[App.mySocketId].dead
                                            });
        },

        onGameList: function(data) {
            App.Host.showGamesList(data);
        },

        onPlayerRuned: function(data) {
            App.players[data.player.mySocketId].course = data.player.course;
            App.Player.runPlayer(data.player);

            /*if ( App.mySocketId !== data.player.mySocketId ) {
                App.players[data.player.mySocketId].course = data.player.course;
                App.Player.runPlayer(data.player);
            } else {
                var interpolation = App.players[App.mySocketId].posX - data.player.posX;
            }*/
        },

        onPlayerStoped: function(data) {
            App.Player.stopPlayer(data.player);

            /*if ( App.mySocketId !== data.player.mySocketId ) {

                //var interpolation = {};
                //interpolation.x = data.player.posX - App.players[data.player.mySocketId].posX;
                //interpolation.y = data.player.posY - App.players[data.player.mySocketId].posY;

                App.Player.stopPlayer(data.player);
            }*/
        },

        onPlayerJoinedGame: function(data) {
            if ( data.passCheck === false ) {
                $("#inputPassword").val('') ;
                $("#passStatus").html('Password FALSE');
            } else {

                if ( App.mySocketId === data.player.mySocketId ) {
                    $("#passStatus").html('');
                    App.players = data.players;
                    App.$gameArea.html( App.$gameFieldTemplate );
                    App.drawingLevel();

                    App.showPlayers(data);
                } else {
                    console.log('join new gamer');
                    App.players = data.players;
                    App.Player.createPlayer( data.player );
                }

            }
        }
    }

    var App = {

        gameId: 0,
        mySocketId: '',
        players: {},
        playerActive: null,
        levelPlan : [
          "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",   // (1)
          "w                 wwww                 w",   // (2)
          "w www wwwwwwwwwww      wwwwwwwwwww www w",   // (3)
          "w www wwwwwwwwwwwwwwwwwwwwwwwwwwww www w",   // (4)
          "w www wwwwwwwwwwwwwwwwwwwwwwwwwwww www w",   // (5)
          "w                                      w",   // (6)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (7)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (8)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (9)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (10)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (11)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (12)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (13)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (14)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (15)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (16)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (17)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (18)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (19)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (20)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (21)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (22)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (23)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (24)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (25)
          "w wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww w",   // (26)
          "w                                      w",   // (27)
          "w www wwwwwwwwwwwwwwwwwwwwwwwwwwww www w",   // (28)
          "w www wwwwwwwwwwwwwwwwwwwwwwwwwwww www w",   // (29)
          "w www wwwwwwwwwww      wwwwwwwwwww www w",   // (30)
          "w                 wwww                 w",   // (31)
          "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",   // (32)
        ],

        init: function() {
            App.cacheElements();
            App.cacheProperty();
            App.showInitScreen();
            App.bindEvents();

            FastClick.attach(document.body);
        },

        cacheElements: function() {
            App.$doc = $(document);

            // Templates
            App.$gameArea = $('#gameArea');
            App.$gameFieldArea = $('#gameFieldArea');
            App.$templateHelloScreen = $('#hello-screen-template').html();
            App.$templateCreateGame = $('#create-game-template').html();
            App.$templateCreateGameMenu = $('#create-game-menu-template').html();
            App.$templateJoinGame = $('#join-game-template').html();

            App.$templateJoinSelectGame = $('#join-select-game-template').html();

            App.$templateJoinGameMenu = $('#join-game-menu-template').html();
            App.$gameFieldTemplate = $('#game-field-template').html();
        },

        cacheProperty: function() {

            App.$bodyWidth = document.body.clientWidth;
            App.$bodyHeight = document.body.clientHeight;

            App.Player.$courseLeft = 'url(img/tankLeft.png)';
            App.Player.$courseRight = 'url(img/tankRight.png)';
            App.Player.$courseTop = 'url(img/tankTop.png)';
            App.Player.$courseBottom = 'url(img/tankBottom.png)';

            App.$initTankSize = 40;
            App.$initWallSize = 50;
        },

        bindEvents: function() {

            App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
            App.$doc.on('click', '#btnBuild', App.Host.onBuildClick);

            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '.gameList', App.Player.onPlayerSelectGameClick);

            App.$doc.on('click', '#btnStart', App.Player.onPlayerStartClick);

            App.$doc.on('keydown', App.Host.runHostPlayerEvent );

            window.addEventListener('resize', App.resize);
        },

        showInitScreen: function() {
            App.$gameArea.html(App.$templateHelloScreen);
            App.doTextFit('.title');
        },

        resize: function() {
            $("#gameArea").css({
                'width': window.innerWidth + 'px',
                'height': window.innerHeight + 'px'
            });
        },

        showPlayers: function(data) {

                App.hostSocketId = data.hostSocketId;
                if ( App.playerActive === null ) { App.playerActive = data.playerActive; }

                var players = App.players;
                for (var player in players) {
                    if ( players.hasOwnProperty(player) ) {
                        App.Player.createPlayer( players[player] );

                        /*App.Player.createStatisticPlayer({ num: e,
                                                           playerName: data.players[e].playerName,
                                                           kill: data.players[e].kill,
                                                           dead: data.players[e].dead
                                                       });*/
                    }
                }

                /*for (var i = 0, l = data.players.length; i < l; i++) {
                    (function(e){
                        App.Player.createPlayer(data.players[e]);

                        App.Player.createStatisticPlayer({ num: e,
                                                           playerName: data.players[e].playerName,
                                                           kill: data.players[e].kill,
                                                           dead: data.players[e].dead
                                                        });

                    })(i);
                }*/

        },

        drawingLevel: function() {
            $("#gameArea").css({ 'background-image': 'none' });

            for (var i = 0; i < App.levelPlan.length; i++) {
                for (var j = 0; j < App.levelPlan[i].length; j++) {

                    if ( App.levelPlan[i][j] === "w" ) {

                        $("#gameFieldAreaWrapper").append( $('<div/>').addClass('wallContainer')
                                                               .css({'left': App.$initWallSize * j,
                                                                     'top': App.$initWallSize * i,
                                                                     'width': App.$initWallSize + 'px',
                                                                     'height': App.$initWallSize + 'px' }) );
                    }
                }
            }

        },

        Host: {

            refreshAnimateFrameID: null,

            onCreateClick: function() {
                IO.socket.emit('hostCreateNewGame');
            },

            gameInit: function(data){
                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.$gameArea.html( App.$templateCreateGameMenu );
            },

            onBuildClick: function() {

                App.Player.hostSocketId = App.mySocketId;

                var data = {
                    gameName: $('#inputGameName').val(),
                    playerName: $('#inputYourNickname').val() || 'anon',
                    password: $('#inputPassword').val(),
                    gameId: App.gameId,
                    hostSocketId: App.Player.hostSocketId
                };

                IO.socket.emit('hostBuildGame', data);
            },

            showGamesList: function(data) {
                App.$gameArea.html(App.$templateJoinGameMenu);
                var gamesList = data.gameList;

                $(".joinGameMenuWrapperWrapper").append( $('<div/>').addClass('gameList gameListTitul').append( $('<div/>').addClass('gameListName').html('Game Name') )
                                                                                         .append( $('<div/>').addClass('gameListTrack').html('Tracking Time') )
                                                                                         .append( $('<div/>').addClass('gameListPlayers').html('Players') )
                                                                                         .append( $('<div/>').addClass('gameListMeatrating').html('Meat Rating') )
                                                                                         .append( $('<div/>').addClass('gameListPassword').html('Password') )
                                                        );

                for (var i in gamesList) {

                    var track = ( gamesList[i].tracking[1]<10 ) ? ( '0' + gamesList[i].tracking[0] + 'h:0' +  gamesList[i].tracking[1] + 'm' )
                                                                : ( '0' + gamesList[i].tracking[0] + 'h:' +  gamesList[i].tracking[1] + 'm' );



                    $(".joinGameMenuWrapperWrapper").append( $('<div/>').addClass('gameList').append( $('<div/>').addClass('gameListName').html(gamesList[i].gameName) )
                                                                                             .append( $('<div/>').addClass('gameListTrack').html( track ))
                                                                                             .append( $('<div/>').addClass('gameListPlayers').html(gamesList[i].players) )
                                                                                             .append( $('<div/>').addClass('gameListMeatrating').html(gamesList[i].meatRating) )
                                                                                             .append( $('<div/>').addClass('gameListPassword').html(gamesList[i].passwordStatus) )
                                                                                             .append( $('<div/>').addClass('gameListId').html(gamesList[i].gameId).css({'display': 'none'}) )
                                                            );

                }
            },

            runHostPlayerEvent: function(eventObject) {
                if ((eventObject.keyCode === 39) && (App.Player.canRun === true) ) {
                    App.Player.canRun = false;
                    App.players[App.mySocketId].course = 'right';
                    //App.Host.runHostPlayer();
                    IO.socket.emit('playerRun', { course: App.players[App.mySocketId].course, player: App.players[App.mySocketId] });
                }
                if ((eventObject.keyCode === 37) && (App.Player.canRun === true) ) {
                    App.Player.canRun = false;
                    App.players[App.mySocketId].course = 'left';
                    //App.Host.runHostPlayer();
                    IO.socket.emit('playerRun', { course: App.players[App.mySocketId].course, player: App.players[App.mySocketId] });
                }
                if ((eventObject.keyCode === 38) && (App.Player.canRun === true) ) {
                    App.Player.canRun = false;
                    App.players[App.mySocketId].course = 'top';
                    App.Host.runHostPlayer();
                    IO.socket.emit('playerRun', { course: App.players[App.mySocketId].course, player: App.players[App.mySocketId] });
                }
                if ((eventObject.keyCode === 40) && (App.Player.canRun === true) ) {
                    App.Player.canRun = false;
                    App.players[App.mySocketId].course = 'bottom';
                    App.Host.runHostPlayer();
                    IO.socket.emit('playerRun', { course: App.players[App.mySocketId].course, player: App.players[App.mySocketId] });
                }

                App.$doc.on('keyup', function(event){

                    if ( App.Player.canRun === false ) {
                        cancelAnimationFrame( App.Host.refreshAnimateFrameID );
                        App.Player.canRun = true;
                        IO.socket.emit('playerStop', { course: App.players[App.mySocketId].course, player: App.players[App.mySocketId] });
                    }

                });

                if (eventObject.keyCode === 27) {
                    $("#statFieldArea").css({'display': 'block'});
                    App.$doc.on('keyup', function(){
                        $("#statFieldArea").css({'display': 'none'});
                    });
                }
            },

            runHostPlayer: function() {

                var refresh = function(){

                    App.Host.refreshAnimateFrameID = requestAnimationFrame(refresh);

                    var dt = 0.017;

                    if ( App.players[App.mySocketId].course === 'right') { App.players[App.mySocketId].posX += App.Player.speedPlayer*dt; }
                    if ( App.players[App.mySocketId].course === 'left' ) { App.players[App.mySocketId].posX -= App.Player.speedPlayer*dt; }
                    if ( App.players[App.mySocketId].course === 'top' ) { App.players[App.mySocketId].posY -= App.Player.speedPlayer*dt; }
                    if ( App.players[App.mySocketId].course === 'bottom' ) { App.players[App.mySocketId].posY += App.Player.speedPlayer*dt; }

                    $('.tankContainer_'+ App.mySocketId ).css({'left': App.players[App.mySocketId].posX + 'px',
                                                                'top': App.players[App.mySocketId].posY + 'px',
                                                                'background-image':  App.Player.getCourseURL(App.players[App.mySocketId].course)
                                                        });

                    App.Player.windowRotate();

                }
                refresh();
            }

        },

        Player: {
            hostSocketId: '',
            canRun: true,
            refreshAnimateFrameID: {},
            speedPlayer: 300,

            onJoinClick: function() {
                IO.socket.emit('getGames');
            },

            onPlayerSelectGameClick: function() {

                App.gameId = $(this).find(".gameListId").text();
                App.$gameArea.html( App.$templateJoinSelectGame );

            },

            onPlayerStartClick: function() {
                var data = {
                    playerName: $('#inputYourNickname').val() || 'anon',
                    password: $('#inputPassword').val() || '',
                    gameId: App.gameId,
                    mySocketId: App.mySocketId
                };

                //App.Player.myName = data.playerName;
                IO.socket.emit('playerJoinGame', data);
            },

            createPlayer: function(player) {
                $("#gameFieldAreaWrapper").append( $('<div/>').addClass('tankContainer tankContainer_' + player.mySocketId)
                                                       .css({'left': player.posX + 'px',
                                                            'top': player.posY + 'px',
                                                            'width': App.$initTankSize + 'px',
                                                            'height': App.$initTankSize + 'px',
                                                            'background-image':  App.Player.getCourseURL(player.course)
                                                        }) );

                App.Player.windowRotate();
            },

            createStatisticPlayer: function(data) {

                $("#statContainer").append( $('<div/>').addClass('statContainerItem statItem' + data.num)
                                                       .append( $('<div/>').addClass('statContainerItemName').text( data.playerName))
                                                       .append( $('<div/>').addClass('statContainerItemKill').text( 'Kill:' + data.kill))
                                                       .append( $('<div/>').addClass('statContainerItemDead').text( 'Dead:' + data.dead))
                                    );
            },

            runPlayer: function(player) {
                var player = player;

                var refresh = function(){

                    App.Player.refreshAnimateFrameID[player.mySocketId] = requestAnimationFrame(refresh);

                    var dt = 0.017;

                    if ( player.course === 'right') { App.players[player.mySocketId].posX += App.Player.speedPlayer*dt; }
                    if ( player.course === 'left' ) { App.players[player.mySocketId].posX -= App.Player.speedPlayer*dt; }
                    if ( player.course === 'top' ) { App.players[player.mySocketId].posY -= App.Player.speedPlayer*dt; }
                    if ( player.course === 'bottom' ) { App.players[player.mySocketId].posY += App.Player.speedPlayer*dt; }

                    $('.tankContainer_'+ player.mySocketId ).css({'left': App.players[player.mySocketId].posX + 'px',
                                                                'top': App.players[player.mySocketId].posY + 'px',
                                                                'background-image':  App.Player.getCourseURL(App.players[player.mySocketId].course)
                                                        });

                    //App.Player.windowRotate();

                }
                refresh();
            },

            stopPlayer: function(player) {
                cancelAnimationFrame( App.Player.refreshAnimateFrameID[player.mySocketId] );
            },

            getCourseURL: function(course) {
                if ( course === 'left' ) { return App.Player.$courseLeft };
                if ( course === 'right' ) { return App.Player.$courseRight };
                if ( course === 'top' ) { return App.Player.$courseTop };
                if ( course === 'bottom' ) { return App.Player.$courseBottom };

            },

            windowRotate: function() {
                $("#gameFieldAreaWrapper").css({ 'left':  $("#gameArea").width()/2 - App.players[App.mySocketId].posX +'px', 'top':  $("#gameArea").height()/2 - App.players[App.mySocketId].posY +'px' });
            }
        },

        doTextFit: function(el) {
            textFit(
                $(el)[0], {
                    alignHoriz: true,
                    alignVert: false,
                    widthOnly: true,
                    reProcess: true,
                    maxFontSize: 300
                }
            );
        }

    };


    IO.init();
    App.init();

    // $('#gameArea').html( $('#hello-screen-template').html() );

}($));

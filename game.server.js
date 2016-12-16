var io;
var gameSocket;
var positions = [
    { posX: 50, posY: 50, course: 'right'},
    { posX: 1900, posY: 50, course: 'left'},
    { posX: 50, posY: 1500, course: 'right'},
    { posX: 1900, posY: 1500, course: 'left'}
];
var games = {};
var actions = [{}];


exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });

    //host events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('hostBuildGame', hostBuildGame);

    //join events
    gameSocket.on('getGames', getGames);
    gameSocket.on('playerJoinGame', playerJoinGame);

    gameSocket.on('playerRun', playerRun);
    gameSocket.on('playerStop', playerStop);

    gameSocket.on('regularUpdate', regularUpdate);


    gameSocket.on('disconnect', playerDisconnect);

}

function hostCreateNewGame() {
    var thisGameId = ( Math.random()*10000 ) | 0;
    this.emit('newGameCreated', { gameId: thisGameId, mySocketId: this.id});
    this.join(thisGameId.toString());
}

function hostBuildGame(data) {

    this.playerSocketId = data.mySocketId;
    this.gameId = data.gameId;
    this.myNum = 0;

    var newGame = {};
    newGame.gameName = data.gameName;
    newGame.tracking = [0,0];
    newGame.playersNums = 1;
    newGame.meatRating = 'hard';
    newGame.password = data.password;
    newGame.passwordStatus = (data.password === '') ? 'FREE' : 'PASS';
    newGame.gameId = data.gameId;
    newGame.hostSocketId = data.hostSocketId;

    var newPlayer = {};
    newPlayer.playerName = data.playerName;
    newPlayer.posX = positions[0].posX;
    newPlayer.posY = positions[0].posY;
    newPlayer.course = positions[0].course;
    newPlayer.kill = 0;
    newPlayer.dead = 0;
    newPlayer.reloading = true;
    newPlayer.bullets = [null, null];
    newPlayer.mySocketId = data.hostSocketId;

    newGame.players = {};
    newGame.players[newPlayer.mySocketId] = newPlayer;

    games[this.gameId] = {};
    games[this.gameId] = newGame;

    io.sockets.in(this.gameId).emit('buildedGame', { game: newGame, player: newPlayer, playerActive: 0, players: newGame.players });
    incTracking();
    //regularUpdateForClient();

    function incTracking(){
        var timeout = setInterval(function(){
            if (games[data.gameId] === undefined) { clearInterval(timeout); }
            else {
                games[data.gameId].tracking[1] +=1;
                if (games[data.gameId].tracking[1] === 60) { games[data.gameId].tracking[1] = 0;
                    games[data.gameId].tracking[0] +=1;

                }
                incTracking();
            }
        }, 60000);
    }

    function regularUpdateForClient() {
        //var players = games[this.gameId].players;
        //console.log(  games[data.gameId] );
        setInterval(function() {
            io.sockets.in(this.gameId).emit('regularUpdateForClient', { players: games[data.gameId].players });
        }, 50)
    }

}


function getGames() {
    this.emit('gameList', { gameList: games});
}

function playerJoinGame(data) {

    var sock = this;
    var room = gameSocket.manager.rooms["/" + data.gameId];

    var passCheck;
    var newPlayer = {};
    var empty;

    if( room != undefined ){

        if ( data.password === games[data.gameId].password ) {
            passCheck = true;

            //data.mySocketId = sock.id;
            this.playerSocketId = data.mySocketId;
            this.gameId = data.gameId;
            sock.join(data.gameId);

            empty = games[data.gameId].playersNums;
            games[data.gameId].playersNums +=1;

            newPlayer.playerName = data.playerName;
            newPlayer.posX = positions[empty].posX;
            newPlayer.posY = positions[empty].posY;
            newPlayer.course = positions[empty].course;
            newPlayer.kill = 0;
            newPlayer.dead = 0;
            newPlayer.reloading = true;
            newPlayer.bullets = [null, null];
            newPlayer.mySocketId = data.mySocketId;

            games[data.gameId].players[newPlayer.mySocketId] = newPlayer;

            io.sockets.in(this.gameId).emit('playerJoinedGame', { passCheck: passCheck,
                                                                  player: newPlayer,
                                                                  playerActive: empty,
                                                                  players: games[[this.gameId]].players,
                                                                  //gameId: data.gameId,
                                                                  hostSocketId: games[data.gameId].hostSocketId
                                                              });
            //regularUpdateForClient();

        } else { passCheck = false;
            this.emit('playerJoinedGame', { passCheck: passCheck });
        }



    } else {
        this.emit('error',{message: "This room does not exist."} );
    }


}

function playerRun(data){
    games[this.gameId].players[data.player.mySocketId].course = data.player.course;
    io.sockets.in(this.gameId).emit('playerRuned', { player: games[this.gameId].players[data.player.mySocketId] });
}

function playerStop(data){
    //games[this.gameId].players[data.player.mySocketId].course = data.player.course;
    games[this.gameId].players[data.player.mySocketId].posX = data.player.posX;
    games[this.gameId].players[data.player.mySocketId].posY = data.player.posY;
    io.sockets.in(this.gameId).emit('playerStoped', { player: games[this.gameId].players[data.player.mySocketId] });
}

function regularUpdate(data) {
    games[this.gameId].players = data.players;
}

function playerDisconnect(data) {

    if ( this.gameId !== undefined ) {

        delete games[this.gameId].players[this.id];
        games[this.gameId].playersNums -=1;

        io.sockets.in(this.gameId).emit('playerDisconnect', { playerSocketId: this.id });

        if ( games[this.gameId].playersNums === 0 ) { delete games[this.gameId]; }
    }
}




// ----------------------------------------------------------------------------------------------------------- //


















//

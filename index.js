let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let onlineUsers = [];
io.on('connection', (socket) => {

  socket.on('disconnect', function () {
    var i = 0;
    while (i < onlineUsers.length) {
      if (onlineUsers[i].userid == socket.id) {
        break;
      }
      i++;
    }
    console.log(socket.nickname + ' disconnected');

    onlineUsers.splice(i, 1);
    //io.emit('connectedUsers', onlineUsers);
    io.emit('users-changed', {
      user: socket.nickname,
      event: 'left'
    }); 
    io.emit('connectedUsers', {
      users: onlineUsers,
      event: 'online'
    }); 
    console.log("Online users");
    for(var i=0; i<onlineUsers.length; i++){
      console.log(onlineUsers[i].username+"\n");
    }
  });

  socket.on('set-nickname', (nickname) => {
    console.log(" set-nickname ::: " + nickname);
    socket.nickname = nickname;
    onlineUsers.push({
      userid: socket.id,
      username: nickname
    });
    
    io.emit('users-changed', {
      user: nickname,
      event: 'joined'
    });
    io.emit('connectedUsers', {
      users: onlineUsers,
      event: 'online'
    }); 
    console.log("Online users:");
    for(var i=0; i<onlineUsers.length; i++){
      console.log(onlineUsers[i].username+"\n");
    }
    //io.emit('connectedUsers', onlineUsers);
  });

  socket.on('add-message', (message) => {
    console.log(" add-message ::: " + message);
    io.emit('message', {
      text: message.text,
      from: socket.nickname,
      created: new Date()
    });
  });

  socket.on('chatting', function (message, sender, receiver) {
    socket.to(receiver).emit('reciverPeer', message, socket.id, receiver);
    socket.emit('senderPeer', message, socket.id, receiver);
  })
});

var port = process.env.PORT || 3500;

http.listen(port, function () {
  console.log('listening in http://localhost:' + port);
});
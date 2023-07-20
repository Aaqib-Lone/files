const express = require('express');
const userRouter = require('./Routes/user');
const questionsRouter = require('./Routes/questions');
const supportRouter = require('./Routes/support');
const supportHistoryRouter = require('./Routes/supportHistory');
const cors = require('cors');
const app = express();
const createConnection = require('./db');
const { Server } = require('socket.io');
const auth = require('./Middlewares/auth');
const helmet = require('helmet');
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(helmet());

const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});
const users = {};

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('join_room', (data) => {
    socket.join(data.room);
    users[data.username] = socket.id;
    console.log(`User with id ${socket.id} joined the room ${data.room}`);
    console.log(users);
  });
  socket.on('getUsers', () => {
    socket.emit('users', users);
  });

  socket.on('send_message', (msg_data) => {
    console.log(msg_data);
    console.log('send message called', msg_data.room);
    socket.to(msg_data.room).emit('receive_message', msg_data);
  });

  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
    // socket.broadcast.emit("callEnded")
  });

  socket.on('callUser', (data) => {
    io.to(data.userToCall).emit('callUser', { signal: data.signalData, from: data.from, name: data.name });
  });

  socket.on('answerCall', (data) => {
    // console.log(data.signal);
    // console.log(data.to);
    io.to(data.to).emit('callAccepted', data.signal);
  });

  socket.on('supportReq', () => {
    console.log('called!!!!!');
    io.sockets.emit('refreshSupportReq');
  });
});

// Apply the authentication middleware before the routes
app.use(auth);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/questions', questionsRouter);
app.use('/api/v1/support', supportRouter);
app.use('/api/v1/history', supportHistoryRouter);

// Ensure connection is established before starting the server
(async () => {
  try {
    const dbConnection = await createConnection();
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to MySQL database:', err);
    process.exit(1);
  }
})();

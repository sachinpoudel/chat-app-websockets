import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
    }
});


io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

const ROOM = 'group'
socket.on('join', async (userName:string) => {
    console.log(`User ${userName} joined with ID: ${socket.id}`);
    await socket.join(ROOM);
    io.to(ROOM).emit('group_notice', userName);
})










    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });

});


const PORT = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from TypeScript Express!');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})

import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose
 from 'mongoose';
import dotenv from 'dotenv';
import { User } from './model/nameSchema.js';
import cors from 'cors';


dotenv.config();

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



socket.on('message', (msg: {sender: string, text: string, id: number}) => {
    console.log('message received:', msg);
    // broadcast to others in the room
    socket.to(ROOM).emit('message', msg);
}

);

socket.on('typing', (userName:string) => {
    socket.to(ROOM).emit('typing', userName);
});
socket.on('stop_typing', (userName:string) => {
    socket.to(ROOM).emit('stop_typing', userName);
});

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });

});


const PORT = 3000;

app.use(express.json());
app.use(cors())


mongoose.connect(process.env.MONGO_URL!).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

app.post('/api/users', (req: Request, res: Response) => {
  try {
    const {name} = req.body;
    const user = new User({name});
    user.save();
    res.status(200).send('User saved');
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).send('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})

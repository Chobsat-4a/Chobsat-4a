import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log(`Novo usuário conectado → ${socket.id}`);

  socket.on('chatMessage', (text) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) return;

    const messageData = {
      text: text.trim(),
      sender: socket.id,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    io.emit('chatMessage', messageData);
  });

  socket.on('fileUpload', (fileData) => {
    if (!fileData?.name || !fileData?.url) return;

    const fileMessage = {
      name: fileData.name,
      type: fileData.type || 'application/octet-stream',
      url: fileData.url,
      sender: socket.id,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    io.emit('fileUpload', fileMessage);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado → ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
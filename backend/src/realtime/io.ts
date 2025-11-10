import { Server as IOServer } from 'socket.io'
let io: IOServer | null = null

export function initIO(httpServer: any, corsOrigin: string) {
  io = new IOServer(httpServer, { cors: { origin: corsOrigin, credentials: true } })
  io.on('connection', (socket) => {
    console.log('[ws] connected', socket.id)
  })
  return io
}

export function getIO() {
  if (!io) throw new Error('IO not initialized')
  return io
}
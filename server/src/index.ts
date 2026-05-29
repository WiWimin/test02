import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
dotenv.config()

import { env } from './config/env'
import { errorHandler } from './middleware/error'
import { setupSocket } from './socket/chat'

import authRoutes from './routes/auth'
import petAddressRoutes from './routes/petAddress'
import sitterRoutes from './routes/sitter'
import serviceRoutes from './routes/service'
import orderRoutes from './routes/order'
import reviewRoutes from './routes/review'
import chatRoutes from './routes/chat'
import walletRoutes from './routes/wallet'
import adminRoutes from './routes/admin'
import uploadRoutes from './routes/upload'

const app = express()
const http = createServer(app)
const io = new Server(http, {
  cors: { origin: env.CORS_ORIGIN, credentials: true },
})

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api', petAddressRoutes)
app.use('/api/sitters', sitterRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/uploads', express.static('uploads'))

// Error handler
app.use(errorHandler)

// Socket.IO
setupSocket(io)

http.listen(env.PORT, () => {
  console.log(`🚀 PetCare API Server running on http://localhost:${env.PORT}`)
  console.log(`📡 WebSocket ready`)
})

export default app

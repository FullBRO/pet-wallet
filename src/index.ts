import 'dotenv/config'
import { bot } from './bot/instance.js'
import './bot/handler.js'  // register listeners

import express from 'express'
import { routes } from './routes/index.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/api', routes)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`)
})

console.log('Bot started...')

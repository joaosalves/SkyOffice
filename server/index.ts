import https from 'https'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import path from 'path' // Novo
import { Server, LobbyRoom } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import { RoomType } from '../types/Rooms'

import { SkyOffice } from './rooms/SkyOffice'

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors())
app.use(express.json())

// Configuração de HTTPS
const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/office.px.center/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/office.px.center/fullchain.pem'),
}

const server = https.createServer(httpsOptions, app)
const gameServer = new Server({
  server,
})

// Serve os arquivos estáticos do Next.js
app.use(express.static(path.join(__dirname, '../client/dist')))

// Configuração padrão do Colyseus
gameServer.define(RoomType.LOBBY, LobbyRoom)
gameServer.define(RoomType.PUBLIC, SkyOffice, {
  name: 'Public Lobby',
  description: 'For making friends and familiarizing yourself with the controls',
  password: null,
  autoDispose: false,
})
gameServer.define(RoomType.CUSTOM, SkyOffice).enableRealtimeListing()

// Rotas Colyseus
app.use('/colyseus', monitor())

// Captura todas as outras rotas e envia para o cliente
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/out/index.html'))
})

gameServer.listen(port)
console.log(`Listening on wss://office.px.center:${port}`)

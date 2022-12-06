const express = require('express')
const app = express()
const http = require('http')
const { Server } = require("socket.io")
const cors = require("cors")

const CARDS = "ES OB EK TL TF CL GA YT PU RT HR MO JS FR BU HT WS AA WP NH EL FM IM AH SD CB OK MC IP KC LO PR EJ NS VM PD AT OS AN YD OV FN ZC ET BF ME FR EP IL DG ER AL"

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    socket.on('join', lobby => {
        socket.join(lobby)
    })

    socket.on('leave', lobby => {
        socket.leave(lobby)
        io.to(lobby).emit('left')

        let deck = []
        for (let i = 0; i < CARDS.length/3; i++) {
            deck.push(CARDS.substring(3 * i, 3 * i + 2))
        }
        let shuffled = deck
          .map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value)
          
        io.to(lobby).emit('doRollcall', shuffled)
    })

    socket.on('refreshLobby', (lobby) => {
        let deck = []
        for (let i = 0; i < CARDS.length/3; i++) {
            deck.push(CARDS.substring(3 * i, 3 * i + 2))
        }
        let shuffled = deck
          .map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value)
          
        io.to(lobby).emit('doRollcall', shuffled)
    })

    socket.on('rollcall', (data) => {
        data['count'] = Array.from(io.sockets.adapter.rooms.get(data.lobby)).length
        io.to(data.lobby).emit('rollcallResponse', data)
    })

    socket.on('play', (data) => {
        io.to(data.lobby).emit('newWord', data.word)
    })

    socket.on('iWon', (data) => {
        io.to(data.lobby).emit('showWinner', data.user)
    })

    socket.on('stuck', (lobby) => {
        io.to(lobby).emit('stuck')
    })

    socket.on('reroll', (data) => {
        io.to(data.lobby).emit('reroll', data.randInt)
    })
})

server.listen(process.env.PORT || 3000)
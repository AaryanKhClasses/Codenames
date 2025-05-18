const io = require('socket.io')(3001, {
    cors: { origin: ['http://localhost:3000'] }
})

const rooms = {}
const socketToUser = {}

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode)
        if (!rooms[roomCode]) {
            const colorDistribution = [
                "red", "red", "red", "red", "red", "red", "red", "red", "red",
                "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue",
                "black",
                "gray", "gray", "gray", "gray", "gray", "gray"
            ]
            fetch('https://random-word-api.herokuapp.com/word?number=25&length=5')
            .then(res => res.json())
            .then(randomWords => {
                const shuffledColors = colorDistribution.sort(() => Math.random() - 0.5)
                rooms[roomCode] = {
                    colors: shuffledColors,
                    words: randomWords,
                    roles: {},
                    revealed: []
                }
                socket.emit('initializeGame', rooms[roomCode])
            })
        }
        if (io.sockets.adapter.rooms.get(roomCode)?.size > 4) return socket.emit('roomFull')
        socket.emit('initializeGame', rooms[roomCode])
    })

    socket.on('selectRole', ({ role, username }) => {
        const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id)
        if (roomCode) {
            rooms[roomCode].roles[role] = username
            socketToUser[socket.id] = { roomCode, role, username }
            io.to(roomCode).emit('roleSelected', { role, username })
            if (Object.keys(rooms[roomCode].roles).length === 4) io.to(roomCode).emit('gameStarted')
        }
    })

    socket.on('submitHint', ({ hint, number, turn }) => {
        const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id)
        if (roomCode) {
            let nextTurn
            if(turn == "redSpy") nextTurn = "redOp"
            else if(turn == "blueSpy") nextTurn = "blueOp"
            io.to(roomCode).emit('hintSubmitted', { hint, number, turn: nextTurn })
        }
    })

    socket.on('endTurn', ({ turn }) => {
        const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id)
        if (roomCode) {
            let nextTurn
            if(turn === "redOp") nextTurn = "blueSpy"
            else if(turn === "blueOp") nextTurn = "redSpy"
            io.to(roomCode).emit('turnEnded', { turn: nextTurn })
        }
    })

    socket.on('revealCard', ({ index, color, turn }) => {
        const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id)
        if (roomCode) {
            if (!rooms[roomCode].revealed) rooms[roomCode].revealed = []
            if (!rooms[roomCode].revealed.includes(index)) rooms[roomCode].revealed.push(index)

            const revealedIndices = rooms[roomCode].revealed
            const colors = rooms[roomCode].colors
            const redRevealed = revealedIndices.filter(i => colors[i] === "red").length
            const blueRevealed = revealedIndices.filter(i => colors[i] === "blue").length

            let nextTurn = turn
            if((turn === "redOp" && color !== "red")) nextTurn = "blueSpy"
            else if((turn === "blueOp" && color !== "blue")) nextTurn = "redSpy"
            if(color === "black") return io.to(roomCode).emit('gameOver', { currentTurn: turn })
            if (redRevealed === 9 || blueRevealed === 9) return io.to(roomCode).emit('gameOver', { currentTurn: redRevealed === 9 ? "blueOp" : "redOp" })
            io.to(roomCode).emit('cardRevealed', { index, turn: nextTurn })
        }
    })

    socket.on('disconnect', () => {
        const userInfo = socketToUser[socket.id]
        if (userInfo) {
            const { roomCode, role, username } = userInfo
            if (rooms[roomCode] && rooms[roomCode].roles[role] === username) {
                delete rooms[roomCode].roles[role]
                io.to(roomCode).emit('updateRoles', rooms[roomCode].roles)
            }
            delete socketToUser[socket.id]
        }
    })
})
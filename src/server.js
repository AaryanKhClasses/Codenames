const io = require('socket.io')(3001, {
    cors: { origin: ['http://localhost:3000'] }
})

const rooms = {}

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
            const words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "cat", "dog", "elephant", "frog", "giraffe", "hippo", "iguana", "jaguar", "kangaroo", "lion", "monkey", "newt", "octopus", "penguin", "quail", "rabbit", "snake", "tiger", "umbrella", "vulture", "walrus", "xenops", "yak", "zebra"]
            const shuffledColors = colorDistribution.sort(() => Math.random() - 0.5)
            const shuffledWords = words.sort(() => Math.random() - 0.5)
            rooms[roomCode] = {
                colors: shuffledColors,
                words: shuffledWords,
                roles: {}
            }
        }
        if (io.sockets.adapter.rooms.get(roomCode)?.size > 4)return socket.emit('roomFull')
        socket.emit('initializeGame', rooms[roomCode])
    })

    socket.on('selectRole', ({ role, username }) => {
        const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id)
        if (roomCode) {
            rooms[roomCode].roles[role] = username
            io.to(roomCode).emit('roleSelected', { role, username })
        }
    })

    socket.on('submitHint', ({ hint, number }) => {
        const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id)
        if (roomCode) {
            io.to(roomCode).emit('hintSubmitted', { hint, number })
        }
    })

    socket.on('disconnect', () => {
        const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id)
        if (roomCode) {
            const roles = rooms[roomCode]?.roles || {}
            for (const [role, username] of Object.entries(roles)) {
                if (username === socket.id) {
                    delete roles[role]
                }
            }
            io.to(roomCode).emit('updateRoles', roles)
        }
    })
})
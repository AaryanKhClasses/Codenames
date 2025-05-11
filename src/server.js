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
            rooms[roomCode] = { colors: shuffledColors, words: shuffledWords }
        }
        socket.emit('initializeGame', rooms[roomCode])
    })
})
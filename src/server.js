const io = require('socket.io')(3001, {
    cors: { origin: ['http://localhost:3000'] }
})

const rooms = {}
const socketToUser = {}

const curatedWords = [
    "apple", "fruit", "car", "road", "doctor", "hospital", "cat", "dog", "sun", "moon", "river", "water", "book", "library", "computer", "keyboard", "teacher", "school", "music", "song", "phone", "call", "rain", "umbrella", "fish", "ocean", "bird", "wing", "star", "sky", "bread", "butter", "pen", "paper", "shoe", "foot", "tree", "leaf", "milk", "cow", "train", "track", "camera", "photo", "money", "decade", "summer",
    "bank", "fire", "smoke", "glass", "window", "chair", "table", "ship", "sea", "ring", "finger", "clock", "time", "mountain", "peak", "plane", "airport", "movie", "actor", "paint", "brush", "shirt", "button", "light", "bulb", "cake", "party", "card", "game", "garden", "flower", "beach", "sand", "ice", "snow", "king", "queen", "salt", "pepper", "dog", "bone", "car", "engine", "eye", "face", "hand", "century", "autumn",
    "arm", "door", "lock", "mouse", "cheese", "desk", "office", "road", "sign", "map", "route", "cup", "tea", "fork", "knife", "spoon", "plate", "bed", "pillow", "shirt", "collar", "pants", "belt", "sock", "shoe", "hat", "head", "nose", "mouth", "ear", "hair", "finger", "toe", "leg", "knee", "back", "chest", "heart", "lung", "brain", "blood", "bone", "skin", "muscle", "stomach", "liver", "kidney", "eye", "age",
    "sight", "ear", "hearing", "nose", "smell", "mouth", "taste", "hand", "touch", "foot", "walk", "run", "jump", "swim", "fly", "drive", "ride", "climb", "fall", "stand", "sit", "lie", "sleep", "dream", "think", "learn", "teach", "read", "write", "draw", "paint", "sing", "dance", "play", "work", "rest", "eat", "drink", "cook", "bake", "wash", "clean", "build", "make", "fix", "break", "open", "close", "start", "spring",
    "stop", "go", "come", "leave", "arrive", "enter", "exit", "meet", "greet", "talk", "listen", "ask", "answer", "help", "save", "find", "lose", "win", "buy", "sell", "pay", "cost", "give", "take", "send", "receive", "show", "hide", "love", "hate", "like", "dislike", "want", "need", "hope", "wish", "wait", "choose", "pick", "select", "prefer", "enjoy", "miss", "remember", "forget", "begin", "finish", "end", "era",
    "repeat", "continue", "change", "stay", "move", "turn", "spin", "roll", "slide", "push", "pull", "lift", "drop", "throw", "catch", "hit", "kick", "shoot", "score", "pass", "block", "guard", "attack", "defend", "fight", "win", "lose", "draw", "tie", "lead", "follow", "join", "leave", "invite", "refuse", "accept", "decline", "agree", "disagree", "promise", "threaten", "warn", "advise", "suggest", "recommend", "season",
    "order", "command", "request", "demand", "offer", "refuse", "allow", "forbid", "permit", "prohibit", "enable", "disable", "activate", "deactivate", "start", "stop", "pause", "resume", "play", "record", "save", "load", "open", "close", "lock", "unlock", "turn", "switch", "press", "release", "hold", "touch", "tap", "click", "double", "right", "left", "up", "down", "in", "out", "on", "off", "over", "under", "period",
    "above", "below", "near", "far", "next", "last", "first", "early", "late", "soon", "now", "then", "before", "after", "again", "once", "twice", "always", "never", "sometimes", "often", "rarely", "usually", "occasionally", "frequently", "regularly", "daily", "weekly", "monthly", "yearly", "hourly", "minute", "second", "moment", "time", "day", "night", "morning", "evening", "afternoon", "week", "month", "year", "winter"
]

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
            const relatedWords = [
                "apple", "fruit", "car", "road", "doctor", "hospital", "cat", "dog",
                "sun", "moon", "river", "water", "book", "library", "computer", "keyboard",
                "teacher", "school", "music", "song", "phone", "call", "rain", "umbrella",
                "fish", "ocean", "bird", "wing", "star", "sky", "bread", "butter"
            ]
            const chosenRelated = relatedWords.sort(() => Math.random() - 0.5).slice(0, 8)
            const remainingWords = curatedWords.filter(w => !chosenRelated.includes(w))
            const randomWords = chosenRelated.concat(
                remainingWords.sort(() => Math.random() - 0.5).slice(0, 25 - chosenRelated.length)
            )
            const shuffledColors = colorDistribution.sort(() => Math.random() - 0.5)
            rooms[roomCode] = {
                colors: shuffledColors,
                words: randomWords,
                roles: {},
                revealed: []
            }
            socket.emit('initializeGame', rooms[roomCode])
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

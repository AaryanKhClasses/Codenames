"use client"

import { useState, useEffect, useRef } from "react"
import Card from "./Card"
import { io } from "socket.io-client"

export default function Room({ roomCode }: { roomCode: string }) {
    if (typeof window === 'undefined') return null
    const socketRef = useRef<any>(null)

    const username = sessionStorage.getItem("username")
    const userRole = sessionStorage.getItem("playerType")

    const [redOperative, setRedOperative] = useState(false)
    const [redSpymaster, setRedSpymaster] = useState(false)
    const [blueOperative, setBlueOperative] = useState(false)
    const [blueSpymaster, setBlueSpymaster] = useState(false)
    const [shuffledColors, setShuffledColors] = useState<string[]>([])
    const [shuffledWords, setShuffledWords] = useState<string[]>([])
    const [roleSelected, setRoleSelected] = useState(false)
    const [revealedCards, setRevealedCards] = useState<boolean[]>(Array(25).fill(false))
    const [redOperativeUsername, setRedOperativeUsername] = useState<string | null>(null)
    const [redSpymasterUsername, setRedSpymasterUsername] = useState<string | null>(null)
    const [blueOperativeUsername, setBlueOperativeUsername] = useState<string | null>(null)
    const [blueSpymasterUsername, setBlueSpymasterUsername] = useState<string | null>(null)
    const [hintText, setHintText] = useState<string>("")
    const [hintNumber, setHintNumber] = useState<string>("")

    const [isGameStarted, setIsGameStarted] = useState(false)
    type TurnType = 'redSpy' | 'redOp' | 'blueSpy' | 'blueOp' | 'gameOver'
    const [turn, setTurn] = useState<TurnType>('blueSpy')
    const [winningTeam, setWinningTeam] = useState<string>("")

    useEffect(() => {
        socketRef.current = io('http://localhost:3001')

        socketRef.current.on('connect', () => {
            sessionStorage.setItem('roomCode', roomCode)
            socketRef.current.emit('joinRoom', roomCode)
        })

        socketRef.current.on('gameStarted', () => setIsGameStarted(true))
        socketRef.current.on('roomFull', () => {
            alert("The room is full.")
            window.location.href = "/"
        })

        socketRef.current.on('initializeGame', ({ colors, words, roles }: { colors: string[], words: string[], roles: { [key: string]: string } }) => {
            setShuffledColors(colors)
            setShuffledWords(words)
            
            if (roles.redOp) {
                setRedOperative(true)
                setRedOperativeUsername(roles.redOp)
            }
            if (roles.redSpy) {
                setRedSpymaster(true)
                setRedSpymasterUsername(roles.redSpy)
            }
            if (roles.blueOp) {
                setBlueOperative(true)
                setBlueOperativeUsername(roles.blueOp)
            }
            if (roles.blueSpy) {
                setBlueSpymaster(true)
                setBlueSpymasterUsername(roles.blueSpy)
            }
        })

        socketRef.current.on('roleSelected', ({ role, username }: { role: string, username: string }) => {
            if (role === 'redOp') {
                setRedOperative(true)
                setRedOperativeUsername(username)
            }
            if (role === 'redSpy') {
                setRedSpymaster(true)
                setRedSpymasterUsername(username)
            }
            if (role === 'blueOp') {
                setBlueOperative(true)
                setBlueOperativeUsername(username)
            }
            if (role === 'blueSpy') {
                setBlueSpymaster(true)
                setBlueSpymasterUsername(username)
            }
        })

        socketRef.current.on('hintSubmitted', ({ hint, number, turn }: { hint: string, number: number, turn: TurnType }) => {
            // TODO: Replace this alert with a more friendly modal
            alert("The hint is " + hint.toUpperCase() + " with number " + number)
            setHintText(hint.toUpperCase())
            setHintNumber(number.toString())
            setTurn(turn)
        })

        socketRef.current.on('turnEnded', ({ turn }: { turn: TurnType }) => {
            // TODO: Alert that the turn has ended using a modal
            setHintText("")
            setHintNumber("")
            setTurn(turn)
        })

        socketRef.current.on('cardRevealed', ({ index, turn }: { index: number, turn: TurnType }) => {
            setRevealedCards(prev => {
                const updated = [...prev]
                updated[index] = true
                return updated
            })
            if(turn == "redSpy" || turn == "blueSpy") {
                setHintText("")
                setHintNumber("")
            }
            setTurn(turn)
        })

        socketRef.current.on('gameOver', ({ currentTurn }: { currentTurn: TurnType }) => {
            let teamName = currentTurn === 'redSpy' || currentTurn === 'redOp' ? 'Blue' : 'Red'
            alert("Game Over! " + teamName + " Team won!")
            setTurn('gameOver')
            setWinningTeam(teamName)
        })

        socketRef.current.on('updateRoles', (roles: { [key: string]: string }) => {
            setRedOperative(!!roles.redOp)
            setRedOperativeUsername(roles.redOp || null)
            setRedSpymaster(!!roles.redSpy)
            setRedSpymasterUsername(roles.redSpy || null)
            setBlueOperative(!!roles.blueOp)
            setBlueOperativeUsername(roles.blueOp || null)
            setBlueSpymaster(!!roles.blueSpy)
            setBlueSpymasterUsername(roles.blueSpy || null)
        })

        return () => socketRef.current.disconnect()
    }, [roomCode])

    const handleRedOperativeClick = () => {
        sessionStorage.setItem("playerType", "redOp")
        setRedOperative(true)
        setRedOperativeUsername(username)
        setRoleSelected(true)
        socketRef.current.emit('selectRole', { role: 'redOp', username })
    }
    const handleRedSpymasterClick = () => {
        sessionStorage.setItem("playerType", "redSpy")
        setRedSpymaster(true)
        setRedSpymasterUsername(username)
        setRoleSelected(true)
        socketRef.current.emit('selectRole', { role: 'redSpy', username })
    }
    const handleBlueOperativeClick = () => {
        sessionStorage.setItem("playerType", "blueOp")
        setBlueOperative(true)
        setBlueOperativeUsername(username)
        setRoleSelected(true)
        socketRef.current.emit('selectRole', { role: 'blueOp', username })
    }
    const handleBlueSpymasterClick = () => {
        sessionStorage.setItem("playerType", "blueSpy")
        setBlueSpymaster(true)
        setBlueSpymasterUsername(username)
        setRoleSelected(true)
        socketRef.current.emit('selectRole', { role: 'blueSpy', username })
    }

    const handleHintSubmit = () => {
        if(hintText.length == 0) return alert("Please provide a hint.")
        if(hintText.includes(" ")) return alert("Hint must be a single word.")
        if(hintNumber.length == 0) return alert("Please provide a number.")
        if(isNaN(Number(hintNumber))) return alert("Please provide a valid number.")
        if(hintNumber.length > 1) return alert("Number must be a single digit.")
        socketRef.current.emit('submitHint', { hint: hintText, number: parseInt(hintNumber), turn })
        alert("Hint submitted successfully!")
    }

    const handleEndTurnSubmit = () => {
        socketRef.current.emit('endTurn', { turn })
    }

    const handleCardClick = (index: number) => {
        if(!isGameStarted || userRole == "redSpy" || userRole == "blueSpy" || (userRole == "redOp" && turn != "redOp") || (userRole == "blueOp" && turn != "blueOp")) return
        setRevealedCards(prev => {
            const updated = [...prev]
            updated[index] = true
            return updated
        })
        socketRef.current.emit('revealCard', { index, color: shuffledColors[index], turn })
    }

    return <>
        {!username && sessionStorage.setItem("username", prompt("Please enter a username") as string)}
        <h2 className="text-center text-2xl">Username: {username}
            { userRole == "redOp" ? <span className="text-red-500"> (Red Operative)</span> :
            userRole == "redSpy" ? <span className="text-red-500"> (Red Spymaster)</span> :
            userRole == "blueOp" ? <span className="text-blue-500"> (Blue Operative)</span> :
            userRole == "blueSpy" ? <span className="text-blue-500"> (Blue Spymaster)</span> : null
            }
        </h2>
        <div className="flex flex-row justify-between items-center">
            <div id="red" className="flex flex-col *:justify-center p-2.5 bg-red-500 w-1/4 h-screen">
                <span>Operative:</span>
                {redOperative ? <span className="text-white p-2 m-2">{redOperativeUsername}</span> :
                    <button className={`bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer ${roleSelected ? 'bg-yellow-700 !cursor-not-allowed' : ''}`} onClick={handleRedOperativeClick} disabled={roleSelected}>
                        Join as Operative
                    </button>
                }
                <span>Spymaster:</span>
                {redSpymaster ? <span className="text-white p-2 m-2">{redSpymasterUsername}</span> :
                    <button className={`bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer ${roleSelected ? 'bg-yellow-700 !cursor-not-allowed' : ''}`} onClick={handleRedSpymasterClick} disabled={roleSelected}>
                        Join as Spymaster
                    </button>
                }
            </div>
            <div id="deck" className="flex flex-col justify-center items-center bg-gray-500 w-1/2 h-screen">
                <div>
                    { isGameStarted ? turn == 'redSpy' ? <span className="text-red-500 text-2xl font-bold">Red Spymaster is Thinking...</span> :
                        turn == 'redOp' ? <span className="text-red-500 text-2xl font-bold">Red Operative is Guessing...</span> :
                        turn == 'blueSpy' ? <span className="text-blue-500 text-2xl font-bold">Blue Spymaster is Thinking...</span> :
                        turn == 'blueOp' ? <span className="text-blue-500 text-2xl font-bold">Blue Operative is Guessing...</span> : null
                    : <span className="text-gray-300 text-2xl font-bold">Waiting for game to start...</span>}
                    { turn == 'gameOver' ? <span className="text-gray-300 text-2xl font-bold">Game Over! The <span className={`text-${winningTeam.toLowerCase()}-500 text-2xl font-bold`}>{winningTeam}</span> Team Wins!</span> : null }
                </div>

                {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex flex-row justify-center items-center p-2 m-2">
                        {Array.from({ length: 5 }, (_, j) => {
                            const index = i * 5 + j
                            return (
                                <Card
                                    key={j}
                                    color={shuffledColors[index]}
                                    word={shuffledWords[index]}
                                    isRevealed={revealedCards[index]}
                                    gameEnded={turn == "gameOver"}
                                    onClick={() => handleCardClick(index)}
                                />
                            )
                        })}
                    </div>
                ))}

                <div id="hint" className="flex flex-row">
                    <input className="border border-gray-300 rounded-md p-2 m-2" disabled={(userRole == "redSpy" && turn == "redSpy") || (userRole == "blueSpy" && turn == "blueSpy") ? false : true} value={hintText} placeholder="Enter a Hint" onChange={(e) => setHintText(e.target.value.toUpperCase())} />
                    <input className="border border-gray-300 rounded-md p-2 m-2 w-10" value={hintNumber} disabled={(userRole == "redSpy" && turn == "redSpy") || (userRole == "blueSpy" && turn == "blueSpy") ? false : true} onChange={(e) => setHintNumber(e.target.value)} />
                    { isGameStarted && (userRole == "redSpy" && turn == "redSpy" || userRole == "blueSpy" && turn == "blueSpy") ? <button className={"bg-green-500 border-black border-2 text-white rounded-lg p-2 m-2 cursor-pointer"} onClick={handleHintSubmit}>Submit</button> :
                        userRole == "redOp" && turn == "redOp" || userRole == "blueOp" && turn == "blueOp" ? <button className="bg-green-500 border-black border-2 text-white rounded-lg p-2 m-2 cursor-pointer" onClick={handleEndTurnSubmit}>End Turn</button> : null }
                </div>
            </div>
            <div id="blue" className="flex flex-col *:justify-center bg-blue-500 p-2.5 w-1/4 h-screen">
                <span>Operative:</span>
                {blueOperative ? <span className="text-white p-2 m-2">{blueOperativeUsername}</span> :
                    <button className={`bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer ${roleSelected ? 'bg-yellow-700 !cursor-not-allowed' : ''}`} onClick={handleBlueOperativeClick} disabled={roleSelected}>
                        Join as Operative
                    </button>
                }
                <span>Spymaster:</span>
                {blueSpymaster ? <span className="text-white p-2 m-2">{blueSpymasterUsername}</span> :
                    <button className={`bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer ${roleSelected ? 'bg-yellow-700 !cursor-not-allowed' : ''}`} onClick={handleBlueSpymasterClick} disabled={roleSelected}>
                        Join as Spymaster
                    </button>
                }
            </div>
        </div>
    </>
}

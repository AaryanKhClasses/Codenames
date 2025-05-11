"use client"

import { useState, useEffect, useRef } from "react"
import Card from "./Card"
import { io } from "socket.io-client"

export default function Room({ roomCode }: { roomCode: string }) {
    if (typeof window === 'undefined') return null
    const socketRef = useRef<any>(null)

    const username = sessionStorage.getItem("username")

    const [redOperative, setRedOperative] = useState(false)
    const [redSpymaster, setRedSpymaster] = useState(false)
    const [blueOperative, setBlueOperative] = useState(false)
    const [blueSpymaster, setBlueSpymaster] = useState(false)
    const [shuffledColors, setShuffledColors] = useState<string[]>([])
    const [shuffledWords, setShuffledWords] = useState<string[]>([])
    const [roleSelected, setRoleSelected] = useState(false)

    useEffect(() => {
        socketRef.current = io('http://localhost:3001')
        socketRef.current.on('connect', () => {
            sessionStorage.setItem('roomCode', roomCode)
            socketRef.current.emit('joinRoom', roomCode)
        })

        socketRef.current.on('initializeGame', ({ colors, words }: { colors: string[], words: string[] }) => {
            setShuffledColors(colors)
            setShuffledWords(words)
        })

        return () => socketRef.current.disconnect()
    }, [roomCode])

    const handleRedOperativeClick = () => {
        sessionStorage.setItem("playerType", "redOp")
        setRedOperative(true)
        setRoleSelected(true)
    }
    const handleRedSpymasterClick = () => {
        sessionStorage.setItem("playerType", "redSpy")
        setRedSpymaster(true)
        setRoleSelected(true)
    }
    const handleBlueOperativeClick = () => {
        sessionStorage.setItem("playerType", "blueOp")
        setBlueOperative(true)
        setRoleSelected(true)
    }
    const handleBlueSpymasterClick = () => {
        sessionStorage.setItem("playerType", "blueSpy")
        setBlueSpymaster(true)
        setRoleSelected(true)
    }

    return <>
        {!username && sessionStorage.setItem("username", prompt("Please enter a username") as string)}
        <h2 className="text-center text-2xl">Username: {username}</h2>
        <div className="flex flex-row justify-between items-center">
            <div id="red" className="flex flex-col *:justify-center p-2.5 bg-red-500 w-1/4 h-screen">
                <span>Operative:</span>
                {redOperative ? <span className="text-white p-2 m-2">{username}</span> :
                    <button className={`bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer ${roleSelected ? 'bg-yellow-700 !cursor-not-allowed' : ''}`} onClick={handleRedOperativeClick} disabled={roleSelected}>
                        Join as Operative
                    </button>
                }
                <span>Spymaster:</span>
                {redSpymaster ? <span className="text-white p-2 m-2">{username}</span> :
                    <button className={`bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer ${roleSelected ? 'bg-yellow-700 !cursor-not-allowed' : ''}`} onClick={handleRedSpymasterClick} disabled={roleSelected}>
                        Join as Spymaster
                    </button>
                }
            </div>
            <div id="deck" className="flex flex-col justify-center items-center bg-gray-500 w-1/2 h-screen">
                {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex flex-row justify-center items-center p-2 m-2">
                        {Array.from({ length: 5 }, (_, j) => (
                            <Card
                                key={j}
                                color={shuffledColors[i * 5 + j]}
                                word={shuffledWords[i * 5 + j]}
                                isRevealed={false}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div id="blue" className="flex flex-col *:justify-center bg-blue-500 p-2.5 w-1/4 h-screen">
                <span>Operative:</span>
                {blueOperative ? <span className="text-white p-2 m-2">{username}</span> :
                    <button className={`bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer ${roleSelected ? 'bg-yellow-700 !cursor-not-allowed' : ''}`} onClick={handleBlueOperativeClick} disabled={roleSelected}>
                        Join as Operative
                    </button>
                }
                <span>Spymaster:</span>
                {blueSpymaster ? <span className="text-white p-2 m-2">{username}</span> :
                    <button className={`bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer ${roleSelected ? 'bg-yellow-700 !cursor-not-allowed' : ''}`} onClick={handleBlueSpymasterClick} disabled={roleSelected}>
                        Join as Spymaster
                    </button>
                }
            </div>
        </div>
    </>
}
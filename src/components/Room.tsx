"use client"

import { useState } from "react"
import Card from "./Card"
import { io } from "socket.io-client"

export default function Room() {
    const socket = io('http://localhost:3001')
    socket.on('connect', () => {
        alert(`You connected with ID: ${socket.id}`)
    })

    const username = sessionStorage.getItem("username")
    const words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "cat", "dog", "elephant", "frog", "giraffe", "hippo", "iguana", "jaguar", "kangaroo", "lion", "monkey", "newt", "octopus", "penguin", "quail", "rabbit", "snake", "tiger", "umbrella bird", "vulture", "walrus", "xenops", "yak", "zebra"]
    
    const [redOperative, setRedOperative] = useState(false)
    const [redSpymaster, setRedSpymaster] = useState(false)
    const [blueOperative, setBlueOperative] = useState(false)
    const [blueSpymaster, setBlueSpymaster] = useState(false)

    const handleRedOperativeClick = () => {
        sessionStorage.setItem("playerType", "redOp")
        setRedOperative(true)
        setRedSpymaster(false)
        setBlueOperative(false)
        setBlueSpymaster(false)
    }
    const handleRedSpymasterClick = () => {
        sessionStorage.setItem("playerType", "redSpy")
        setRedSpymaster(true)
        setRedOperative(false)
        setBlueOperative(false)
        setBlueSpymaster(false)
    }
    const handleBlueOperativeClick = () => {
        sessionStorage.setItem("playerType", "blueOp")
        setBlueOperative(true)
        setRedOperative(false)
        setRedSpymaster(false)
        setBlueSpymaster(false)
    }
    const handleBlueSpymasterClick = () => {
        sessionStorage.setItem("playerType", "blueSpy")
        setBlueSpymaster(true)
        setBlueOperative(false)
        setRedOperative(false)
        setRedSpymaster(false)
    }

    return <>
        {!username && sessionStorage.setItem("username", prompt("Please enter a username") as string)}
        <h2 className="text-center text-2xl">Username: {username}</h2>
        <div className="flex flex-row justify-between items-center">
            <div id="red" className="flex flex-col *:justify-center p-2.5 bg-red-500 w-1/4 h-screen">
                <span>Operative:</span>
                {redOperative ? <span className="text-white p-2 m-2">{username}</span> : <button className="bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer" onClick={handleRedOperativeClick}>Join as Operative</button>}
                <span>Spymaster:</span>
                {redSpymaster ? <span className="text-white p-2 m-2">{username}</span> : <button className="bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer" onClick={handleRedSpymasterClick}>Join as Spymaster</button>}
            </div>
            <div id="deck" className="flex flex-col justify-center items-center bg-gray-500 w-1/2 h-screen">
                {(() => {
                    const colorDistribution = ["red", "red", "red", "red", "red", "red", "red", "red", "red", 
                                               "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", 
                                               "black", 
                                               "gray", "gray", "gray", "gray", "gray", "gray"];
                    const shuffledColors = colorDistribution.sort(() => Math.random() - 0.5);

                    return Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="flex flex-row justify-center items-center p-2 m-2">
                            {Array.from({ length: 5 }, (_, j) => (
                                <Card key={j} color={shuffledColors[i * 5 + j]} word={words[i * 5 + j]} isRevealed={false} />
                            ))}
                        </div>
                    ));
                })()}
            </div>
            <div id="blue" className="flex flex-col *:justify-center bg-blue-500 p-2.5 w-1/4 h-screen">
                <span>Operative:</span>
                {blueOperative ? <span className="text-white p-2 m-2">{username}</span> : <button className="bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer" onClick={handleBlueOperativeClick}>Join as Operative</button>}
                <span>Spymaster:</span>
                {blueSpymaster ? <span className="text-white p-2 m-2">{username}</span> : <button className="bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer" onClick={handleBlueSpymasterClick}>Join as Spymaster</button>}
            </div>
        </div>
    </>
}
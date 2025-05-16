"use client"

import { useState } from "react"

export default function Home() {
    const [username, setUsername] = useState<string>("")
    const [roomCode, setRoomCode] = useState<string>("")

    const handleCreateRoom = () => {
        if(username.length < 3) return alert("Username must be at least 3 characters long.")
        sessionStorage.setItem("username", username)
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        location.href = `/${code}`
    }

    const handleJoinRoom = () => {
        if(username.length < 3) return alert("Username must be at least 3 characters long.")
        if(roomCode.length == 0) return alert("Please provide a room code.")  
        sessionStorage.setItem("username", username)
        location.href = `/${roomCode}`
    }

    return <>
        <h1 className="text-center text-2xl">CODENAMES CLONE</h1>
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col">
                <input type="text" className="border border-gray-300 rounded-md p-2 m-2" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <button className="bg-blue-500 text-white rounded-md p-2 m-2 cursor-pointer" onClick={handleCreateRoom}>Create New Room</button>
                <div className="flex flex-row">
                    <input type="text" className="border border-gray-300 rounded-md p-2 m-2" placeholder="Enter Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                    <button className="bg-green-500 text-white rounded-md p-2 m-2 cursor-pointer" onClick={handleJoinRoom}>Join Room</button>
                </div>
            </div>
        </div>
    </>
}
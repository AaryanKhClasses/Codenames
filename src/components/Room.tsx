"use client"

import Card from "./Card"

export default function Room() {
    return <>
        <h2 className="text-center text-2xl">Username: {sessionStorage.getItem("username")}</h2>
        <div className="flex flex-row justify-between items-center">
            <div id="red" className="flex flex-col *:justify-center p-2.5 bg-red-500 w-1/4 h-screen">
                <span>Operative:</span>
                <button className="bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer">Join as Operative</button>
                <span>Spymaster:</span>
                <button className="bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer">Join as Spymaster</button>
            </div>
            <div id="deck" className="flex flex-col justify-center items-center bg-gray-500 w-1/2 h-screen">
                {Array.from({ length: 5 }, async(_, i) => (
                    <div key={i} className="flex flex-row justify-center items-center p-2 m-2">
                        {Array.from({ length: 5 }, async(_, j) => {
                            return (
                                <Card
                                    key={j}
                                    color={j % 2 === 0 ? "red" : "blue"}
                                    word={"test word"}
                                    isRevealed={false}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
            <div id="blue" className="flex flex-col *:justify-center bg-blue-500 p-2.5 w-1/4 h-screen">
                <span>Operative:</span>
                <button className="bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer">Join as Operative</button>
                <span>Spymaster:</span>
                <button className="bg-yellow-500 text-white rounded-md p-2 m-2 cursor-pointer">Join as Spymaster</button>
            </div>
        </div>
    </>
}
"use server"

export default async function getRandomWord() {
    const response = await fetch("https://random-word-api.herokuapp.com/word", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    const data = await response.json()
    return data[0] as string
}
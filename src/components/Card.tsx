"use client"

type CardProps = {
    color: string
    word: string
    isRevealed: boolean
}

export default function Card(props: CardProps) {
    return (
        <button className={`flex flex-col justify-center items-center p-2.5 w-1/4 ${props.isRevealed ? `bg-${props.color}-500` : "bg-gray-500"} border-black border-1 rounded-md m-2 cursor-pointer`}>
            {props.word}
        </button>
    );
}
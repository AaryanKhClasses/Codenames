"use client"

type CardProps = {
    color: string
    word: string
    isRevealed: boolean
}

export default function Card(props: CardProps) {
    const playerType = sessionStorage.getItem("playerType")
    return (
        <button className={`flex flex-col justify-center items-center p-2.5 min-w-[100px] border-black border-1 rounded-md m-2 cursor-pointer
            ${playerType == "redSpy" || playerType == "blueSpy" || props.isRevealed ? `bg-${props.color}-500` : "bg-gray-500"}
        `}>
            {props.word}
        </button>
    );
}
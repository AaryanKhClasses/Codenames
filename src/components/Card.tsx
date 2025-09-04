"use client"

type CardProps = {
    color: string
    word: string
    isRevealed: boolean
    gameEnded: boolean
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Card(props: CardProps) {
    const playerType = sessionStorage.getItem("playerType")

    const colorClassMap: { [key: string]: string } = {
        red: "bg-red-500",
        blue: "bg-blue-500",
        black: "bg-black",
        gray: "bg-gray-500"
    }

    const backgroundColor =
        playerType === "redSpy" ||
        playerType === "blueSpy" ||
        props.isRevealed ||
        props.gameEnded
            ? colorClassMap[props.color] || "bg-gray-500"
            : "bg-gray-500"

    return <button className={`flex flex-col justify-center items-center p-2.5 min-w-[100px] min-h-[40px] border-black border-1 rounded-md m-2 cursor-pointer ${backgroundColor}`} onClick={props.onClick}>
        {props.isRevealed && !props.gameEnded ? "" : props.word}
    </button>
}

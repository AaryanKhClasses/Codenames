import Room from "@/components/Room"

export default async function RoomPage({ params }: { params: Promise<{ room: string }> }) {
    const roomCode = (await params).room
    return (
        <>
            <h1 className="text-center text-2xl">Room Code: {roomCode}</h1>
            <Room />
        </>
    );
}
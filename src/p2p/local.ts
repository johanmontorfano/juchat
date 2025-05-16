import Peer, { DataConnection } from "peerjs";
import { createSignal } from "solid-js";
import { v6 } from "uuid";
import { ChatEvent, Chats, getAllChats, retrieveChat, saveChat } from "./chats";

// INFO: Peers are meant to always have the same id, therefore a static uuid
// is given to each peer.

if (localStorage.getItem("peerID") === null)
    localStorage.setItem("peerID", v6());

export const peer = new Peer(localStorage.getItem("peerID"));
export const [chats, setChats] = createSignal<Chats[]>(
    getAllChats(),
    {equals: false}
);

(window as any).chats = chats;

export function onConnection(conn: DataConnection) {
    // Sends a dummy to open the connection
    conn.send("dummy");
    conn.on("open", () => {
        // If the chat object of this connection is already loaded, we only
        // modify its fields.

        const i = chats().findIndex(v => v.peerId === conn.peer);

        console.log("connection");

        if (i < 0)
            setChats(p => [...p, retrieveChat(conn)])
        else {
            chats()[i].conn = conn;
            chats()[i].isConnected = true;
            setChats(chats());
        }
    });
    conn.on("data", (ev: ChatEvent) => {
        if ((ev as any) === "dummy")
            return;

        const i = chats().findIndex(v => v.peerId === conn.peer);

        if (ev.kind === "message")
            setChats(p => {
                p[i].chatHistory.push({ from: "remote", content: ev.payload });
                return [...p];
            });
        saveChat(chats()[i]);
    });
    conn.on("error", ev => console.log(ev));
    conn.on("close", () => {
        const i = chats().findIndex(v => v.conn.peer === conn.peer);

        chats()[i].isConnected = false;
        chats()[i].conn = undefined;
        setChats(chats());
    });
}

peer.on("connection", onConnection);

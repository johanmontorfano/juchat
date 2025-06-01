import Peer, { DataConnection } from "peerjs";
import { createSignal } from "solid-js";
import { v6 } from "uuid";
import { ChatEvent, Chats, getAllChats, retrieveChat, saveChat } from "./chats";
import { checkIdentity, idMiddleware, initSafePairing } from "./pairing";

// INFO: Peers are meant to always have the same id, therefore a static uuid
// is given to each peer.

if (localStorage.getItem("peerID") === null)
    localStorage.setItem("peerID", v6());

export const peer = new Peer(localStorage.getItem("peerID"));
export const [chats, setChats] = createSignal<Chats[]>(
    getAllChats(),
    {equals: false}
);

export async function onConnection(conn: DataConnection) {
    // Send the local public key to open the connection.
    conn.send("pk:" + (await initSafePairing()).publicKey);
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

        // Send a challenge request to verify the connection.
        checkIdentity(chats()[i]);
    });
    conn.on("data", (ev: ChatEvent | string) => {
        const i = chats().findIndex(v => v.peerId === conn.peer);

        if (typeof ev === "string" && ev.startsWith("pk:"))
            chats()[i].publicKey = JSON.parse(ev.slice(3));
        if (typeof ev === "object" && ev.kind === "challenge")
            return idMiddleware(conn, ev);
        if (typeof ev === "object" && ev.kind === "message")
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

export function deleteChat(chat: Chats) {
    const i = chats().findIndex(v => v.peerId === chat.peerId);

    if (chat.conn)
        chat.conn.close();
    localStorage.removeItem("ch:" + chat.peerId);
    setChats(p => {
        p.splice(i, 1);
        return p;
    });
}

peer.on("connection", onConnection);

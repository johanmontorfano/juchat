import Peer, { DataConnection } from "peerjs";
import { createSignal } from "solid-js";
import { v6 } from "uuid";
import { ChatEvent, Chats, retrieveChat } from "./chats";

/// INFO: Peers are meant to always have the same id, therefore a static uuid
/// is given to each peer.

if (localStorage.getItem("peerID") === null)
    localStorage.setItem("peerID", v6());

export const peer = new Peer(localStorage.getItem("peerID"));
export const [chats, setChats] = createSignal<Chats[]>([], {equals: false});

export function onConnection(conn: DataConnection) {
    conn.on("open", () => setChats(p => [...p, retrieveChat(conn)]));
    conn.on("data", (ev: ChatEvent) => {
        const i = chats().findIndex(v => v.conn.peer === conn.peer);

        if (ev.kind === "message")
            setChats(p => {
                p[i].chatHistory.push({ from: "remote", content: ev.payload });
                return [...p];
            });
    });
    conn.on("error", ev => console.log(ev));
    conn.on("close", () => setChats(p => {
        const i = p.findIndex(v => v.conn.peer === conn.peer);

        p.splice(i, 1);
        return p;
    }));
}

peer.on("connection", onConnection);

import { DataConnection } from "peerjs";

export interface Chats {
    conn?: DataConnection;
    isConnected: boolean;
    isEncryped: false;
    chatHistory: {from: "local" | "remote", content: string}[];
    profileLocalName: string;
}

export interface ChatEvent {
    kind: "message",
    payload: string
}

/** Will retrieve a chat from local storage according to a peer connection. */
export function retrieveChat(from: DataConnection): Chats {
    const id = from.peer;
    const chat = localStorage.getItem(id);

    if (chat === null) {
        localStorage.setItem(id, JSON.stringify({
            isConnected: false,
            isEncryped: false,
            chatHistory: [],
            profileLocalName: "new chat"
        } as Chats));
        return retrieveChat(from);
    }
    
    const chatObject: Chats = JSON.parse(chat);

    chatObject.conn = from;
    chatObject.isConnected = true;
    return chatObject;
}

/** Will format a chat event */
export function chatEvent(kind: "message", content: string): ChatEvent {
    return { kind, payload: content }
}

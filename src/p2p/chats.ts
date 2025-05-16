import { DataConnection } from "peerjs";

export interface Chats {
    conn?: DataConnection;
    peerId: string;
    isConnected: boolean;
    isEncrypted: false;
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
    const chat = localStorage.getItem("ch:" + id);

    if (chat === null) {
        localStorage.setItem("ch:" + id, JSON.stringify({
            isConnected: false,
            isEncrypted: false,
            chatHistory: [],
            peerId: from.peer,
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

/** This function should not be called after first initialization since it
* is not aware of the app's state */
export function getAllChats(): Chats[] {
    const chats: Chats[] = [];

    for (const key in localStorage) {
        if (key.startsWith("ch:"))
            chats.push(JSON.parse(localStorage.getItem(key)));
    }
    return chats;
}

/** Will save a chat in local storage and strip away all unecessary content */
export function saveChat(chat: Chats) {
    const id = chat.conn ? chat.conn.peer : chat.peerId;

    localStorage.setItem("ch:" + id, JSON.stringify({
        isConnected: false,
        isEncrypted: false,
        peerId: chat.peerId,
        chatHistory: chat.chatHistory,
        profileLocalName: chat.profileLocalName
    } as Chats));
}

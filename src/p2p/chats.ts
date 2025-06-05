import { DataConnection } from "peerjs";

export interface Chats {
    conn?: DataConnection;
    publicKey?: string;
    peerId: string;
    isConnected: boolean;
    isAuthenticated: boolean;
    chatHistory: {from: "local" | "remote", content: string}[];
    profileLocalName: string;
}

export type ChatEventKind = "message" | "challenge" | "challenge_answer";

export interface ChatEvent {
    kind: ChatEventKind;
    payload: string[];
    payload_kind: string[]
}

/** Will retrieve a chat from local storage according to a peer connection. */
export function retrieveChat(from: DataConnection): Chats {
    const id = from.peer;
    const chat = localStorage.getItem("ch:" + id);

    if (chat === null) {
        localStorage.setItem("ch:" + id, JSON.stringify({
            isConnected: false,
            isAuthenticated: false,
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

/** Will format a chat event. Those are formatted as a content string
 * array with unspecified kinds. Kinds can be specified in the third parameter
 * with kind[i] being linked to content[i].
 * 
 * Here are the possible kinds of contents: text, image:[format],
 * audio:[format], file:[format]. All formats may not be implemented. */
export function chatEvent(
    kind: ChatEventKind,
    content: string[],
    content_kind: string[]
): ChatEvent {
    return { kind, payload: content, payload_kind: content_kind };
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
        isAuthenticated: false,
        publicKey: chat.publicKey,
        peerId: chat.peerId,
        chatHistory: chat.chatHistory,
        profileLocalName: chat.profileLocalName
    } as Chats));
}

import { DataConnection } from "peerjs";
import { ChatEvent, chatEvent, Chats } from "./chats";

export interface SafePairingConfig {
    publicKey: string;
    privateKey: string;
}

async function exportKey(key: CryptoKey): Promise<string> {
    const out = await crypto.subtle.exportKey("raw", key);

    return new Uint8Array(out).toString();
}

async function importKey(key: string, encrypt = false): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        "raw", key as any, "RSA-OAEP", true, [encrypt ? "encrypt" : "decrypt"]
    );
}

export async function encrypt(key: string, data: string): Promise<string> {
    const _key = await importKey(key, true);
    const out = await crypto.subtle.encrypt(
        {name: "RSA-OAEP"}, _key, new TextEncoder().encode(data)
    );

    return btoa(String.fromCharCode(...new Uint8Array(out)));
}

export async function decrypt(key: string, data: string): Promise<string> {
    const _key = await importKey(key);
    const out = await crypto.subtle.decrypt(
        {name: "RSA-OAEP"}, _key, new TextEncoder().encode(data)
    );

    return btoa(String.fromCharCode(...new Uint8Array(out)));
}

/** Will load the local configuration of safe pairing from local storage, or
* create a new one if none exists */
async function initSafePairing(): Promise<SafePairingConfig> {
    const config = localStorage.getItem("safepair");

    if (!config) {
        const pair = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        return {
            publicKey: await exportKey(pair.publicKey),
            privateKey: await exportKey(pair.privateKey)
        }
    }

    return JSON.parse(config);
}

/** Add a middleware to connections to automatically send challenge answers
* when received */
export function identityMiddleware(to: Chats) {
    const conn = to.conn;

    if (!to.conn || !to.publicKey)
        return;

    conn.once("data", async (data: ChatEvent) => {
        if (data.kind !== "challenge")
            return;

        const challenge = data.payload;
        const config = await initSafePairing();

        conn.send(chatEvent(
            "challenge_answer",
            await decrypt(config.privateKey, challenge)
        ))
    });
}

/** Safe-pairing allows to check pairs are not spoofing someone else identity
* by checking matching RSA pair, and checking it stays the same. Therefore
* detecting devices spoofing a user without having its key-pair.
*
* To verify identity, the client will send a challenge which consists of a
* random number encrypted using the public key of the target. The target has
* to return it decrypted in its next message. If the next message is not an
* answer to the cryptographic challenge or is wrong, the connection is marked
* as unsafe.
*
* WARN: It does not totally prevent spoofing since an instance will trust the
* first key-pair given by a specific ID. Therefore denying others. */
export async function checkIdentity(to: Chats) {
    const conn = to.conn;
    const challenge = crypto.getRandomValues(new Uint32Array(10))[0];

    if (!to.conn || !to.publicKey)
        return;

    conn.once("data", async (data: ChatEvent) => {
       to.isAuthenticated = data.kind === "challenge_answer" &&
           parseInt(data.payload) === challenge;
    });
    conn.send(chatEvent(
        "challenge",
        await encrypt(to.publicKey, challenge.toString())
    ));
}

import { DataConnection } from "peerjs";
import { ChatEvent, chatEvent, Chats } from "./chats";

export interface SafePairingConfig {
    publicKey: string;
    privateKey: string;
}

// `spki` exports public keys
// `pkcs8` exports private keys
async function exportKey(
    format: "pkcs8" | "spki",
    key: CryptoKey
): Promise<string> {
    const _key = await window.crypto.subtle.exportKey(format, key);
    const buffer = new Uint8Array(_key);

    return btoa(buffer.reduce((p, b) => p + String.fromCharCode(b), ""));

}

async function importKey(key: string, encrypt = false): Promise<CryptoKey> {
    const from = atob(key);
    const buffer = new Uint8Array(from.length);
    const format = encrypt ? "spki" : "pkcs8";
    const usage = encrypt ? "encrypt" : "decrypt";

    buffer.set(from.split("").map(f => f.charCodeAt(0)));
    return await crypto.subtle.importKey(
        format, buffer.buffer, {
            name: "RSA-OAEP",
            hash: "SHA-256"
        }, true, [usage]
    );
}

export async function encrypt(key: string, data: string): Promise<string> {
    const _key = await importKey(key, true);
    const buffer = new TextEncoder().encode(data);
    const out = await crypto.subtle.encrypt({name: "RSA-OAEP"}, _key, buffer);
    
    return btoa(String.fromCharCode(...new Uint8Array(out)));
}

export async function decrypt(key: string, data: string): Promise<string> {
    const _key = await importKey(key, false);
    const binary = atob(data);
    const buffer = new Uint8Array(binary.length);

    buffer.set(binary.split("").map(c => c.charCodeAt(0)));
    return new TextDecoder().decode(await crypto.subtle.decrypt(
        {name: "RSA-OAEP"}, _key, buffer.buffer
    ));
}

/** Will load the local configuration of safe pairing from local storage, or
* create a new one if none exists */
export async function initSafePairing(): Promise<SafePairingConfig> {
    const config = localStorage.getItem("safepair");

    if (!config) {
        const pair = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        const out = {
            publicKey: await exportKey("spki", pair.publicKey),
            privateKey: await exportKey("pkcs8", pair.privateKey)
        }

        localStorage.setItem("safepair", JSON.stringify(out));

        return out;
    }

    return JSON.parse(config);
}

/** Add a middleware to connections to automatically send challenge answers
* when received */
export async function idMiddleware(conn: DataConnection, data: ChatEvent) {
    if (data.kind !== "challenge")
        return;

    const challenge = data.payload;
    const config = await initSafePairing();

    conn.send(chatEvent(
        "challenge_answer",
        await decrypt(config.privateKey, challenge)
    ));
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
* The `update` function is responsible of triggering an update of the signal
* where the chat is stored.
*
* WARN: It does not totally prevent spoofing since an instance will trust the
* first key-pair given by a specific ID. Therefore denying others. */
export async function checkIdentity(to: Chats, update: () => void) {
    const conn = to.conn;
    const challenge = crypto.getRandomValues(new Uint32Array(10))[0];

    if (!to.conn || !to.publicKey)
        return;

    conn.on("data", async (data: ChatEvent) => {
        if (data.kind === "challenge_answer") {
            to.isAuthenticated = parseInt(data.payload) === challenge;
            update();
        }
    });

    conn.send(chatEvent(
        "challenge",
        await encrypt(to.publicKey, challenge.toString())
    ));
}

import { useParams } from "@solidjs/router";
import { createSignal, For } from "solid-js";
import { chatEvent, saveChat } from "../../p2p/chats";
import { chats, onConnection, peer, setChats } from "../../p2p/local";

export function Chat() {
    const [content, setContent] = createSignal("");
    const params = useParams();
    const i = chats().findIndex(v => v.peerId === params.id);

    setTimeout(() => {
        if (!chats()[i].conn) {
            console.log("connect");
            onConnection(peer.connect(chats()[i].peerId));
        }
    }, 500);

    function onSubmit(ev: SubmitEvent) {
        ev.preventDefault();
        console.log(chats());
        setChats(p => {
            p[i].chatHistory.push({ from: "local", content: content() });
            return [...p];
        });
        saveChat(chats()[i]);
        chats()[i].conn.send(chatEvent("message", content()));
        setContent("");
    }

    return <div>
        <div>
            <For each={chats()[i].chatHistory}>
                {data => <p>{data.from}: {data.content}</p>}
            </For>
        </div>
        <div>
            <form onSubmit={onSubmit}>
                <input type="text"
                    value={content()}
                    onChange={ev => setContent(ev.target.value)}
                    placeholder="Write your message"
                />
                <input type="submit" value="send" />
            </form>
        </div>
    </div>
}

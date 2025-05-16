import { useParams } from "@solidjs/router";
import { createSignal, For } from "solid-js";
import { chatEvent, saveChat } from "../../p2p/chats";
import { chats, onConnection, peer, setChats } from "../../p2p/local";

function Bubble(props: { from: "local" | "remote", content: string }) {
    const local = props.from === "local";
    const bubble = local ? "bg-blue-500 text-white" : "bg-slate-200";

    return <div class={`flex ${local ? "justify-end" : ""} w-full`}>
        <p class={`p-[4px] m-[4px] min-w-[80px] ${bubble} rounded-[5px]`}>
            {props.content}
        </p>
    </div>
}

export function Chat() {
    const [content, setContent] = createSignal("");
    const params = useParams();
    const i = chats().findIndex(v => v.peerId === params.id);

    setTimeout(() => {
        if (!chats()[i].conn)
            onConnection(peer.connect(chats()[i].peerId));
    }, 500);

    function onSubmit(ev: SubmitEvent) {
        ev.preventDefault();
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
            <For each={chats()[i].chatHistory} children={Bubble} />
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

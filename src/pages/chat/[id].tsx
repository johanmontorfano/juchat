import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, For } from "solid-js";
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
    const [i, setI] = createSignal(0);
    const params = useParams();
    const navigate = useNavigate();

    setI(chats().findIndex(v => v.peerId === params.id));
    setTimeout(() => {
        if (!chats()[i()].conn)
            onConnection(peer.connect(chats()[i()].peerId));
    }, 500);

    function onSubmit(ev: SubmitEvent) {
        ev.preventDefault();
        setChats(p => {
            p[i()].chatHistory.push({ from: "local", content: content() });
            return [...p];
        });
        saveChat(chats()[i()]);
        chats()[i()].conn.send(chatEvent("message", content()));
        setContent("");
    }

    createEffect(() => {
        setI(chats().findIndex(v => v.peerId === params.id));
    });

    if (i() < 0)
        navigate("/chat");

    return <div class="relative max-h-[calc(90dvh_-_1px)] h-[calc(90dvh_-_1px)]">
        <div class="pb-14 max-h-[calc(90dvh_-_1px)] overflow-auto">
            <For each={chats()[i()].chatHistory} children={Bubble} />
        </div>
        <div class="absolute bottom-0 flex justify-center w-full">
            <form onSubmit={onSubmit} class="p-4 w-full max-w-[900px]">
                <input type="text"
                    value={content()}
                    onChange={ev => setContent(ev.target.value)}
                    placeholder="Write your message"
                    class="custom-input submit-side w-[calc(100%_-_60px)] shadow-xl"
                    disabled={!chats()[i()].isConnected}
                />
                <input type="submit"
                    value="send"
                    class="custom-input submit-side w-[60px] shadow-xl"
                    disabled={!chats()[i()].isConnected}
                />
            </form>
        </div>
    </div>
}

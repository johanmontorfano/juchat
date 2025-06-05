import { useNavigate, useParams } from "@solidjs/router";
import { IoImageOutline, IoImagesOutline } from "solid-icons/io";
import { createEffect, createSignal, For } from "solid-js";
import { chatEvent, saveChat } from "../../p2p/chats";
import { chats, onConnection, peer, setChats } from "../../p2p/local";

function Bubble(props: {
    from: "local" | "remote",
    content: string[],
    content_kind: string[]
}) {
    const local = props.from === "local";
    const bubble = local ?
        "bg-blue-500 text-white dark:bg-blue-600" :
        "bg-slate-200 dark:bg-gray-500";

    return <div class={`flex ${local ? "justify-end" : ""} w-full`}>
        <For each={props.content}>{(c, i) =>
            props.content_kind[i()] === "text" ?
                <p class={`p-[4px] m-[4px] min-w-[80px] ${bubble} rounded-[5px]`}>
                    {c}
                </p>
            : null
        }</For>
    </div>
}

export function Chat() {
    const [content, setContent] = createSignal("");
    const [i, setI] = createSignal(0);
    const params = useParams();
    const navigate = useNavigate();

    let imagePicker: HTMLInputElement | null = null;

    setI(chats().findIndex(v => v.peerId === params.id));
    setTimeout(() => {
        if (!chats()[i()].conn)
            onConnection(peer.connect(chats()[i()].peerId));
    }, 500);

    function onSubmit(ev: SubmitEvent) {
        ev.preventDefault();
        setChats(p => {
            p[i()].chatHistory.push({
                from: "local",
                content: [content()],
                content_kind: ["text"]
            });
            return [...p];
        });
        saveChat(chats()[i()]);
        chats()[i()].conn.send(chatEvent("message", [content()], ["text"]));
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
            <form onSubmit={onSubmit} class="p-4 w-full max-w-[900px] flex align-end">
                <input type="text"
                    value={content()}
                    onChange={ev => setContent(ev.target.value)}
                    placeholder="Write your message"
                    class="custom-input submit-side w-[calc(100%_-_100px)] shadow-xl"
                    disabled={!chats()[i()].isConnected}
                />
                <input type="file"
                    accept="image/*"
                    hidden="hidden"
                    ref={r => imagePicker = r}
                />
                <button class="custom-input center-side w-[40px] shadow-xl p-0"
                    disabled={!chats()[i()].isConnected}
                    onClick={ev => {
                        ev.preventDefault();
                        imagePicker?.click();
                    }}
                >
                    <IoImagesOutline size={24} />
                </button>
                <input type="submit"
                    value="send"
                    class="custom-input submit-side w-[60px] shadow-xl"
                    disabled={!chats()[i()].isConnected}
                />
            </form>
        </div>
    </div>
}

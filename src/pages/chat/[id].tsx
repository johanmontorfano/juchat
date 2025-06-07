import { useNavigate, useParams } from "@solidjs/router";
import { IoImagesOutline } from "solid-icons/io";
import { createEffect, createSignal, For, Show } from "solid-js";
import { chatEvent, saveChat } from "../../p2p/chats";
import { chats, onConnection, peer, setChats } from "../../p2p/local";
import { Oval } from "solid-spinner";

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
            <p class={`p-[4px] m-[4px] min-w-[80px] ${bubble} rounded-[5px]`}>{
                props.content_kind[i()] === "text" ?
                    c : <img src={c}
                        width={250} 
                        height={300} 
                        class="border rounded-sm"
                    />
            }</p>
        }</For>
    </div>
}

export function Chat() {
    const [content, setContent] = createSignal<string[]>([""]);
    const [contentKind, setContentKind] = createSignal<string[]>(["text"]);
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
                content: content(),
                content_kind: contentKind()
            });
            return [...p];
        });
        saveChat(chats()[i()]);
        chats()[i()].conn.send(chatEvent("message", content(), contentKind()));
        setContent([""]);
        setContentKind(["text"]);
    }

    // NOTE: This can easily be made to work with any kind of document, but to
    // begin, images are enough.
    function onLoadImages(ev: Event & {target: HTMLInputElement}) {
        const images: string[] = [];
        const types: string[] = [];
        const reader = new FileReader();

        setContentKind(["loading"]);
        const out = new Promise<void>(resolve => {
            let i = 0;

            reader.readAsDataURL(ev.target.files[0]);
            reader.addEventListener("load", () => {
                images.push(reader.result as string);
                types.push(ev.target.files[i].type);
                i++;
                if (i >= ev.target.files.length) {
                    setContent(images);
                    setContentKind(types);
                    resolve();
                } else reader.readAsDataURL(ev.target.files[i]);
            });
        });

        return out;
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
        <div class="absolute bottom-0 flex flex-col items-center w-full">
            <Show when={contentKind()[0] !== "text"}>
                <div class="custom-input w-full max-w-[900px] rounded-md shadow-xl flex">
                    <Show when={contentKind()[0] === "loading"} 
                        fallback={<Oval />}>
                        <For each={content()}>
                            {v => <img src={v} 
                                width={100}
                                class="mr-2 rounded-sm"
                            />}
                        </For>
                    </Show>
                </div>
            </Show>
            <form onSubmit={onSubmit} class="p-4 w-full max-w-[900px] flex align-end">
                <input type="text"
                    value={content()}
                    onChange={ev => {
                        setContent(p => {
                            p[0] = ev.target.value;
                            return p;
                        });
                        setContentKind(p => {
                            p[0] = "text";
                            return p;
                        });
                    }}
                    placeholder="Write your message"
                    class="custom-input submit-side w-[calc(100%_-_100px)] shadow-xl"
                    disabled={!chats()[i()].isConnected ||
                        contentKind()[0] !== "text"}
                />
                <input type="file"
                    accept="image/*"
                    hidden="hidden"
                    multiple
                    ref={r => imagePicker = r}
                    onChange={ev => {
                        onLoadImages(ev);

                    }}
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

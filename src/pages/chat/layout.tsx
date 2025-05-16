import { RouteSectionProps, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Index, Show } from "solid-js";
import { Popup } from "../../component/popup";
import { saveChat } from "../../p2p/chats";
import { chats, setChats } from "../../p2p/local";

/// A separate component for chat entries allows to not loose reactivity
/// when dealing with changes in the chat name/last chat.
function ChatEntry(props: {id: number}) {
    const params = useParams();

    return <a href={`/chat/${chats()[props.id].peerId}`} 
        class="border-b w-full h-[36px] flex items-center"
        data-active={params.id === chats()[props.id].peerId}
    >
        {chats()[props.id].profileLocalName}
    </a>
}

export function ChatLayout(props: RouteSectionProps<unknown>) {
    const [chatI, setChatI] = createSignal(-1);
    const [profileOpen, setProfileOpen] = createSignal(false);
    const params = useParams();

    createEffect(() => {
        const i = chats().findIndex(v => v.peerId === params.id);

        setChatI(i);
    });

    return <div class="grid grid-cols-[1fr_4fr] w-full h-full">
        <div class="border-r w-full flex flex-col">
            <a href="/chat/new">New chat</a>
            <Index each={chats()}>{(_, i) => <ChatEntry id={i} />}</Index>
        </div>
        <div>
            <div class="flex w-full h-[4dvh] border-b justify-center items-center">
                <Show when={chatI() > -1} fallback="Unnamed chat">
                    <p class="cursor-pointer"
                        onClick={() => setProfileOpen(true)}
                    >
                        {chats()[chatI()].profileLocalName}
                    </p>
                </Show>
            </div>
            {props.children}
        </div>
        <Popup show={profileOpen()} onClose={() => setProfileOpen(false)}>
            <h1 class="text-2xl">
                {chats()[chatI()].profileLocalName}
            </h1>
            <br />
            <p>Peer identifier: {chats()[chatI()].peerId}</p>
            <label>Name: </label>
            <input type="text"
                value={chats()[chatI()].profileLocalName}
                onChange={ev => setChats(p => {
                    p[chatI()].profileLocalName = ev.target.value;
                    saveChat(p[chatI()]);
                    return p;
                })}
            />
        </Popup>
    </div>
}

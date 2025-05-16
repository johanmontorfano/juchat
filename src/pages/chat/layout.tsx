import { RouteSectionProps, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";
import { chats } from "../../p2p/local";

export function ChatLayout(props: RouteSectionProps<unknown>) {
    const [chatI, setChatI] = createSignal(-1);
    const params = useParams();

    createEffect(() => {
        const i = chats().findIndex(v => v.peerId === params.id);

        setChatI(i);
    });

    return <div class="grid grid-cols-[1fr_4fr] w-full h-full">
        <div class="border-r w-full flex flex-col">
            <a href="/chat/new">New chat</a>
            <For each={chats()}>{chat => 
                <a href={`/chat/${chat.peerId}`} 
                    class="border-b w-full h-[36px] flex items-center"
                    data-active={params.id === chat.peerId}
                >
                    {chat.profileLocalName}
                </a>
            }
            </For>
        </div>
        <div>
            <div class="flex w-full h-[4dvh] border-b justify-center items-center">
                <Show when={chatI() > -1} fallback="New chat">
                    <p class="cursor-pointer">
                        {chats()[chatI()].profileLocalName}
                    </p>
                </Show>
            </div>
            {props.children}
        </div>
    </div>
}

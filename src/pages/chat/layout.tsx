import { RouteSectionProps, useParams } from "@solidjs/router";
import { For } from "solid-js";
import { chats } from "../../p2p/local";

export function ChatLayout(props: RouteSectionProps<unknown>) {
    const params = useParams();

    return <div class="grid grid-cols-[1fr_4fr] w-full h-full">
        <div class="border-r">
            <a href="/chat/new">New chat</a>
            <div>
                <For each={chats()}>
                    {chat => <a href={`/chat/${chat.peerId}`}>
                        {chat.profileLocalName}
                    </a>}
                </For>
            </div>
        </div>
        <div>
            <div class="w-full h-[4dvh] border-b align-center">
                {params.id}
            </div>
            {props.children}
        </div>
    </div>
}

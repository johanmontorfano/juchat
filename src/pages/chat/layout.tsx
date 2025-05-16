import { RouteSectionProps } from "@solidjs/router";
import { For } from "solid-js";
import { chats } from "../../p2p/local";

export function ChatLayout(props: RouteSectionProps<unknown>) {
    return <div>
        <div>
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
            Current chat
            {props.children}
        </div>
    </div>
}

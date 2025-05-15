import { RouteSectionProps } from "@solidjs/router";

export function ChatLayout(props: RouteSectionProps<unknown>) {
    return <div>
        <div>Chats</div>
        <div>
            Current chat
            {props.children}
        </div>
    </div>
}

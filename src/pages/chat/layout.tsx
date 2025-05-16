import { RouteSectionProps, useNavigate, useParams } from "@solidjs/router";
import { IoAddOutline, IoChatbubblesOutline, IoClose } from "solid-icons/io";
import { createEffect, createSignal, Index, Show } from "solid-js";
import { Popup } from "../../component/popup";
import { saveChat } from "../../p2p/chats";
import { chats, deleteChat, onConnection, peer, setChats } from "../../p2p/local";

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

function NewChat() {
    const [show, setShow] = createSignal(false);
    const [targetId, setTargetId] = createSignal("");

    function onSubmit(ev: SubmitEvent) {
        ev.preventDefault();
        onConnection(peer.connect(targetId()));
    }

    return <>
        <div class="cursor-pointer bg-[blue] pr-[14px] p-[8px] rounded-[24px] flex items-center absolute bottom-[10px] right-[10px]"
            onClick={() => setShow(true)}
        >
            <IoAddOutline size={24} color="white" />
            <p class="text-white m-0 p-0">New Chat</p>
        </div>
        <Popup show={show()} onClose={() => setShow(false)}>
            <p class="text-2xl text-center">Create a new chat with someone</p>
            <p class="p-4">
                Copy the identifier of this person in the box below to
                initiate a connection
            </p>
            <form onSubmit={onSubmit} class="p-4">
                <input type="text"
                    name="id"
                    value={targetId()}
                    onChange={ev => setTargetId(ev.target.value)}
                    class="custom-input submit-side w-[80%]"
                    placeholder="Enter the ID here"
                />
                <input type="submit"
                    value="Connect"
                    class="custom-input submit-side w-[20%]"
                />
            </form> 
        </Popup>
    </>
}

function NoChatTip() {
    return <div class="w-[calc(100%_-_3rem] h-full flex items-center justify-center m-6">
        <IoChatbubblesOutline size={48} color="gray" />
        <p class="text-center text-[gray]">
            It's too empty here, find someone to chat with
        </p>
    </div>
}

export function ChatLayout(props: RouteSectionProps<unknown>) {
    const [chatI, setChatI] = createSignal(-1);
    const [profileOpen, setProfileOpen] = createSignal(false);
    const [grid, setGrid] = createSignal("1fr_4fr");
    // If set to 0, will only show a single component of the layout depending
    // on the current route.
    const [showAll, setShowAll] = createSignal(1);
    const params = useParams();
    const navigate = useNavigate();
    let prevWidth = 0;

    createEffect(() => {
        const i = chats().findIndex(v => v.peerId === params.id);

        setChatI(i);
    });

    // We check for the screen dimensions 8 times a second to properly update
    // the layout if necessary.
    // TODO: Implement a better way to do this (CSS)
    setInterval(() => {
        const {innerWidth: width} = window;

        if (prevWidth === width)
            return;

        prevWidth = width;

        if (width > 900) setShowAll(1);
        else setShowAll(0);

        if (width > 1400) setGrid("1fr_4fr");
        else if (width > 1100) setGrid("2fr_4fr");
        else if (width > 900) setGrid("2fr_3fr");
        else setGrid("1fr");
    }, 1000 / 8);

    return <div class={`grid grid-cols-[${grid()}] w-full h-full`}>
        <Show when={(params.id && showAll()) || !params.id}>
            <div class="border-r w-full flex flex-col relative">
                <NewChat />
                <Index each={chats()} fallback={NoChatTip}>
                    {(_, i) => <ChatEntry id={i} />}
                </Index>
            </div>
        </Show>
        <Show when={(!params.id && showAll()) || params.id}>
            <div>
                <div class="flex w-full h-[4dvh] border-b justify-between items-center">
                    <Show when={chatI() > -1} fallback="Unnamed chat">
                        <div />
                        <p class="cursor-pointer"
                            onClick={() => setProfileOpen(true)}
                        >
                            {chats()[chatI()].profileLocalName} -
                            {chats()[chatI()].isConnected ? " C" : " Not c"}
                            onnected
                        </p>
                        <IoClose onClick={() => navigate("/chat")}
                            size={28}
                            class="cursor-pointer mr-[12px]"
                        />
                    </Show>
                </div>
            {props.children}
            </div>
        </Show>
        <Popup show={profileOpen()} onClose={() => setProfileOpen(false)}>
            <p class="text-2xl text-center">
                {chats()[chatI()].profileLocalName}
            </p>
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
            <br />
            <br />
            <form onSubmit={ev => {
                const i = chatI();

                ev.preventDefault();
                navigate("/chat");
                setProfileOpen(false);
                // WARN: for some reason doing a timeout to delete a chat
                // prevents a solidjs crash, its likely due to navigate not
                // taking effect before the end of the event, therefore
                // leading to the chat becoming `undefined` for [id] before
                // we are redirected to `/chat`
                setTimeout(() => deleteChat(chats()[i]), 500);
            }} class="flex justify-end w-full">
                <input type="submit"
                    value="Delete chat"
                    class="cursor-pointer bg-[red] p-[8px] rounded-[6px] flex items-center bottom-[10px] text-white"
                />
            </form>
        </Popup>
    </div>
}

import { A, RouteSectionProps } from "@solidjs/router";
import { IoPersonOutline } from "solid-icons/io";
import { createSignal } from "solid-js";
import { Popup } from "./component/popup";
import { peer } from "./p2p/local";

function getLocalStorageOccupiedSpace() {
    const content = [];

    for (const key in localStorage) {
        content.push(key);
        content.push(localStorage.getItem(key));
    }

    // JavaScript's String type is used to represent textual data. 
    // It is a set of "elements" of 16-bit unsigned integer values. 
    let size = JSON.stringify(content).length * 2;
    let sizeUnit = 0;
    const arr = ["bytes","KB","MB","GB","TB"];
    while (size > 1024) {
        sizeUnit++;
        size /= 1024;
    }
    return size.toFixed(2) + arr[sizeUnit];
}

export function RootLayout(props: RouteSectionProps<unknown>) {
    const [menuOpen, setMenuOpen] = createSignal(false);

    return <div class="h-dvh bg-white dark:bg-slate-950 dark:text-white">
        <div class="flex items-center justify-between border-b h-[6dvh]">
            <img src="/assets/logo.png" width={64} height={64} />
            <nav class="hidden md:inline">
                <A activeClass="active" end href="/">Home</A>
                <A activeClass="active" href="/chat">Chats</A>
            </nav>
            <div>
                <IoPersonOutline size={24}
                    class="m-2 cursor-pointer"
                    onClick={() => setMenuOpen(true)}
                />
            </div>
        </div>
        <div class="h-[94dvh]">
            {props.children}
        </div>
        <Popup show={menuOpen()} onClose={() => setMenuOpen(false)}>
            <p class="text-3xl font-bold">Hello there!</p>
            <div class="md:hidden">
                <br />
                <p class="italic">Go to</p>
                <nav class="flex flex-col border rounded-[6px]">
                    <A activeClass="active" end href="/">Home</A>
                    <A activeClass="active" href="/chat">Chats</A>
                </nav>
            </div>
            <br />
            <div class="text-gray-500">
                <p>Stored content size: {getLocalStorageOccupiedSpace()}</p>
                <p>Features: Pair verification</p>
                <p>Your ID: {peer.id}</p>
            </div>
        </Popup>
    </div>
}

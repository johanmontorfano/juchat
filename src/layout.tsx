import { RouteSectionProps } from "@solidjs/router";
import { peer } from "./p2p/local";

export function RootLayout(props: RouteSectionProps<unknown>) {
    return <div class="h-dvh">
        <div class="flex items-center border-b h-[6dvh]">
            <img src="/assets/logo.png" width={64} height={64} />
            <p>{peer.id}</p>
        </div>
        <div class="h-[94dvh]">
            {props.children}
        </div>
    </div>
}

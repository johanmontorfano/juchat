import { RouteSectionProps } from "@solidjs/router";
import { peer } from "./p2p/local";

export function RootLayout(props: RouteSectionProps<unknown>) {
    return <div>
        <div>
            <img src="/assets/logo.png" width={64} height={64} />
            <p>{peer.id}</p>
        </div>
        <div>
            {props.children}
        </div>
    </div>
}

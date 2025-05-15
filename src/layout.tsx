import { RouteSectionProps } from "@solidjs/router";

export function RootLayout(props: RouteSectionProps<unknown>) {
    return <div>
        <div>
            <img src="/assets/logo.png" width={64} height={64} />
        </div>
        <div>
            {props.children}
        </div>
    </div>
}

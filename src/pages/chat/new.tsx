import { createSignal } from "solid-js";
import { onConnection, peer } from "../../p2p/local";

export function ChatNew() {
    const [value, setValue] = createSignal("");

    function onSubmit(ev: SubmitEvent) {
        ev.preventDefault();
        onConnection(peer.connect(value()));
    }

    return <div>
        <form onSubmit={onSubmit}>
            <label>Id</label>
            <input type="text"
                name="id"
                value={value()}
                onChange={ev => setValue(ev.target.value)}
            />
            <input type="submit" value="submit" />
        </form>
    </div>
}

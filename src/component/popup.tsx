import { JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { IoCloseOutline } from "solid-icons/io";

export function Popup(
    props: {
        show: boolean,
        onClose: () => void,
        children: JSX.Element
    }
) {
    return <Show when={props.show}>
        <Portal>
            <div class="popup-container">
                <div class="p-2">
                    <div class="w-full flex justify-end">
                        <IoCloseOutline onClick={props.onClose}
                            size={32}
                            cursor="pointer"
                        />
                    </div>
                    {props.children}
                </div>
            </div>
        </Portal>
    </Show>
}

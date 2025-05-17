import { toCanvas } from "qrcode";
import { isDark } from "..";

export function QRCode(props: {value: string, size: number}) {
    return <div ref={el => {
        toCanvas(props.value, {
            color: {
                dark: isDark ? "#FFFFFFFF" : "#000000FF",
                light: "#00000000"
            },
            width: props.size,
            errorCorrectionLevel: "L",
        },
        (err, canvas) => {
            if (err) throw err;
            el.appendChild(canvas);
        })
    }} />
}

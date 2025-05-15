import { useParams } from "@solidjs/router";

export function Chat() {
    const params = useParams();

    return <p>{params.id}</p>
}

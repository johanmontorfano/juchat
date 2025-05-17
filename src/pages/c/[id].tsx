import { useNavigate, useParams } from "@solidjs/router";
import { onConnection, peer } from "../../p2p/local";

export function LinkOnboarding() {
    const params = useParams();
    const navigate = useNavigate();

    setTimeout(() => {
        onConnection(peer.connect(params.id));
        navigate("/chat/" + params.id);
    }, 500);

    return "Linking...";
}

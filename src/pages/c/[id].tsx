import { useNavigate, useParams } from "@solidjs/router";
import { onConnection, peer } from "../../p2p/local";

export function LinkOnboarding() {
    const params = useParams();
    const navigate = useNavigate();

    onConnection(peer.connect(params.id));
    navigate("/chat/" + params.id);

    return "Linking...";
}

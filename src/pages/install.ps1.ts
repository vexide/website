import type { APIRoute } from "astro";

export const GET: APIRoute = ({ redirect }) => {
    return redirect(
        "https://github.com/vexide/cargo-v5/releases/latest/download/cargo-v5-installer.ps1",
        301,
    );
};

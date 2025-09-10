import { cookies } from "next/headers";

export async function getDefaultCookies() {
    const cookieStore = await cookies();

    const apiKey = cookieStore.get("apiKey")?.value || "";
    const baseURL = cookieStore.get("baseURL")?.value || "";
    const model = cookieStore.get("model")?.value || "";
    
    return {
        apiKey,
        baseURL,
        model
    }
}
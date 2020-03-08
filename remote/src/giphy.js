// vim: ts=4 et sts=4 sw=4

import { get_json } from "./util.js";

const { GIPHY_API_URL, GIPHY_API_KEY, STATIC_URL } = process.env;

export async function random_gif() {
    const query = {
        api_key: GIPHY_API_KEY,
        rating: "g",
        tag: "high five"
    };

    const url = `${GIPHY_API_URL}/random`;
    const { meta, data } = await get_json(url, query);

    return meta.status === 200
        ? data.fixed_height_small_url
        : `${STATIC_URL}/highfive.gif`;
}

// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";

const { BING_API_KEY, BING_STATIC_URL } = process.env;

export function map_image_url(dest, label) {
    const query = {
        key: BING_API_KEY,
        mapSize: "500,260",
        pushpin: `${dest};69;${label.slice(0, 3)}`
    };

    return `${BING_STATIC_URL}/Road/${dest}/16?${stringify(query)}`;
}

// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";
import { get_json } from "./util";

const { MAPS_STATIC_URL, MAPS_PLACES_URL, MAPS_API_KEY } = process.env;

export function map_image_url(dest) {
    const query = {
        key: MAPS_API_KEY,
        size: "500x500",
        maptype: "roadmap",
        style: "feature:poi.business|visibility:off",
        markers: dest
    };

    return `${MAPS_STATIC_URL}?${stringify(query)}`;
}

export function map_dirs_url(orig, dest) {
    return (
        `https://www.google.com/maps/dir/${orig}/${dest}` +
        // Specify walking mode.
        "/data=!4m2!4m1!3e2"
    );
}

export async function place_autocomplete(input) {
    const query = {
        key: MAPS_API_KEY,
        language: "pl",
        input
    };

    const url = `${MAPS_PLACES_URL}/autocomplete/json`;
    const { predictions } = await get_json(url, query);
    return predictions;
}

export async function place_detail(place_id) {
    const query = {
        key: MAPS_API_KEY,
        language: "pl",
        placeid: place_id
    };

    const url = `${MAPS_PLACES_URL}/details/json`;
    const { result } = await get_json(url, query);
    return result;
}

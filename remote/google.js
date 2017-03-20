// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";
import { get_json } from "./util";

const { MAPS_STATIC_URL, MAPS_PLACES_URL, PLACES_API_KEY } = process.env;

export function map_image_url(dest) {
    const query = {
        key: PLACES_API_KEY,
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

async function place_autocomplete(input) {
    const query = {
        key: PLACES_API_KEY,
        types: "geocode",
        language: "pl",
        input
    };

    const url = `${MAPS_PLACES_URL}/autocomplete/json`;
    const { predictions } = await get_json(url, query);
    return predictions;
}

async function place_detail(place_id) {
    const query = {
        key: PLACES_API_KEY,
        language: "pl",
        placeid: place_id
    };

    const url = `${MAPS_PLACES_URL}/details/json`;
    const { result } = await get_json(url, query);
    return result;
}

export async function guess_origin(input) {
    const predictions = await place_autocomplete(input);

    if (predictions.length === 0) {
        return null;
    }

    const [first] = predictions;
    const detail = await place_detail(first.place_id);

    if (!detail) {
        return null;
    }

    const { geometry: { location } } = detail;

    return {
        latitude: location.lat,
        longitude: location.lng,
    };
}

// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";

const { PLACES_API_URL, PLACES_API_KEY } = process.env;

export function map_image_url(dest) {
    const image_query = {
        key: PLACES_API_KEY,
        size: "500x500",
        maptype: "roadmap",
        style: "feature:poi.business|visibility:off",
        markers: dest
    };

    return `${PLACES_API_URL}/staticmap?${stringify(image_query)}`;
}

export function map_dirs_url(orig, dest) {
    return (
        `https://www.google.com/maps/dir/${orig}/${dest}` +
        // Specify walking mode.
        "/data=!4m2!4m1!3e2"
    );
}

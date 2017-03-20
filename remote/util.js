// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";
import fetch, { Headers } from "node-fetch";
import { parseXmlString } from "libxmljs";
import { getDistanceSimple, getBoundsOfDistance } from "geolib";

function err(error) {
    return Object.assign(new Error, error);
}

export async function get_xml(url, query) {
    const query_url = `${url}?${stringify(query)}`;
    const response = await fetch(query_url);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const xml = await response.text();
    return parseXmlString(xml);
}

export async function get_json(url, query) {
    const query_url = `${url}?${stringify(query)}`;
    const response = await fetch(query_url);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

export async function post_json(url, query, body) {
    const query_url = `${url}?${stringify(query)}`;
    const response = await fetch(query_url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(body)
    });

    if (response.ok) {
        return response.json();
    }

    console.error("--- Status ", response.status);

    if (response.status === 400) {
        const { error } = await response.json();
        console.error(error);
        throw err(error);
    }

    console.error(response.statusText);
    throw new Error(response.statusText);
}

export function distance(origin, destination) {
    return getDistanceSimple(origin, destination, 10);
}

export function bounds(point, radius) {
    return getBoundsOfDistance(point, radius);
}

export function bounds_intersect(bounds1, bounds2) {
    const [south_west_1, north_east_1] = bounds1;
    const [south_west_2, north_east_2] = bounds2;

    const x1 = Math.max(south_west_1.longitude, south_west_2.longitude);
    const x2 = Math.min(north_east_1.longitude, north_east_2.longitude);
    const y1 = Math.max(south_west_1.latitude, south_west_2.latitude);
    const y2 = Math.min(north_east_1.latitude, north_east_2.latitude);

    return x1 < x2 && y1 < y2;
}

export function random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

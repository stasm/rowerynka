// vim: ts=4 et sts=4 sw=4

import fetch from "node-fetch";
import { getDistanceSimple } from "geolib";

export async function get(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}

export async function post(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}

export function distance(origin, destination) {
    return getDistanceSimple(origin, destination, 10);
}

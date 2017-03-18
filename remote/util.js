// vim: ts=4 et sts=4 sw=4

import fetch, { Headers } from "node-fetch";
import { parseXmlString } from "libxmljs";
import { getDistanceSimple } from "geolib";

function err(error) {
    return Object.assign(new Error, error);
}

export async function get_xml(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const xml = await response.text();
    return parseXmlString(xml);
}

export async function post_json(url, body) {
    const response = await fetch(url, {
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

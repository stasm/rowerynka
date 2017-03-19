// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";
import { get_xml, distance, bounds, bounds_intersect } from "./util";

const CITIES = require("./cities.json");
const { NEXTBIKE_API_URL } = process.env;
const distances = new WeakMap();

export async function get_stations(origin, radius = 1000) {
    const origin_bounds = bounds(origin, radius);
    const city_ids = CITIES.filter(
        city => bounds_intersect(origin_bounds, city.bounds)
    ).map(
        city => city.uid
    );

    if (city_ids.length === 0) {
        return [];
    }

    const places_in_cities = await Promise.all(
        city_ids.map(get_places_in_city)
    );

    // Flatten the arrays of places for each city.
    const places = [].concat(...places_in_cities);
    const stations = [];

    for (const place of places) {
        const station = from_attrs(place, "name", "lat", "lng", "bikes");
        const station_distance = distance(origin, station);

        if (station_distance <= radius) {
            distances.set(station, station_distance);
            stations.push(station);
        }
    }

    return stations.sort(by_distance);
}

async function get_places_in_city(city_id) {
    const query = {
        city: city_id
    };
    const url = `${NEXTBIKE_API_URL}?${stringify(query)}`;

    const doc = await get_xml(url);
    return doc.find("//place");
}

function from_attrs(node, ...names) {
    const result = {};
    for (const name of names) {
        switch (name) {
            case "lat":
                result.latitude = node.attr(name).value();
                break;
            case "lng":
                result.longitude = node.attr(name).value();
                break;
            case "bikes":
                result.bikes = parseInt(node.attr(name).value(), 10);
                break;
            default:
                result[name] = node.attr(name).value();
        }
    }
    return result;
}

function by_distance(a, b) {
    return distances.get(a) - distances.get(b);
}

// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";
import { get_xml, distance } from "./util";

const { NEXTBIKE_API_URL } = process.env;
const distances = new WeakMap();

export async function get_stations(origin, radius = 1000) {
    const query = {
        // Hardcode Warsaw for now.  In the future, allow users to set their
        // current city or detect it based on their location.
        city: "210"
    };
    const url = `${NEXTBIKE_API_URL}?${stringify(query)}`;

    try {
        var doc = await get_xml(url);
    } catch (err) {
        console.error(err.message);
        return [];
    }

    const places = doc.find("//place");
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

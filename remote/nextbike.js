// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";
import { get } from "./util";

const { NEXTBIKE_API_URL, NEXTBIKE_API_KEY } = process.env;

export async function get_stations(origin, radius = 1000) {
    const { latitude: lat, longitude: lon } = origin;
    const query = {
        apikey: NEXTBIKE_API_KEY,
        circle: `${lon},${lat},${radius}`
    };
    const url = `${NEXTBIKE_API_URL}&${stringify(query)}`;

    try {
        var { result } = await get(url);
    } catch (err) {
        console.error(err.message);
        return [];
    }

    if (typeof result === "string") {
        return [];
    }

    const { featureMemberList } = result;

    return featureMemberList.map(parse_member);
}

function parse_member(member) {
    const { geometry: { coordinates } } = member;
    const [{ latitude, longitude }] = coordinates; // ShapePoint
    return Object.assign(properties(member), {
        latitude, longitude
    });
}

function properties(member) {
    const props = member.properties.reduce(
        (seq, cur) => Object.assign(seq, {
            [cur.key.toLowerCase()]: cur.value
        }),
        {}
    );

    return {
        name: props.lokalizacja,
        bikes: parseInt(props.rowery, 10),
        racks: parseInt(props.stojaki, 10),
    };
}

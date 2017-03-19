// vim: ts=4 et sts=4 sw=4

const fs = require("fs");
const fetch = require("node-fetch");
const { parseXmlString } = require("libxmljs");

const NEXTBIKE_API_URL = "https://nextbike.net/maps/nextbike-live.xml";

main();

async function main() {
    const cities = await get_cities('pl');
    console.log(
        JSON.stringify(cities, null, 4)
    );
}

async function get_cities(country_code) {
    const doc = await get_xml(NEXTBIKE_API_URL);
    const cc = country_code.toUpperCase();
    const cities = doc.find(`//country[@country="${cc}"]/city`);

    return cities.map(
        city => from_attrs(city, "uid", "name", "bounds")
    );
}

async function get_xml(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const xml = await response.text();
    return parseXmlString(xml);
}

function from_attrs(node, ...names) {
    const result = {};
    for (const name of names) {
        switch (name) {
            case "bounds": {
                const bounds = JSON.parse(node.attr(name).value());
                result.bounds = [
                    {
                        latitude: bounds.south_west.lat,
                        longitude: bounds.south_west.lng
                    }, {
                        latitude: bounds.north_east.lat,
                        longitude: bounds.north_east.lng
                    }
                ];
                break;
            }
            default:
                result[name] = node.attr(name).value();
        }
    }
    return result;
}

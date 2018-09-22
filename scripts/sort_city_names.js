// vim: ts=4 et sts=4 sw=4

const fs = require("fs");

main();

function main() {
    const cities_file = process.argv[2];

    if (cities_file) {
        fs.readFile(cities_file, sort);
    } else {
        process.stdin.resume();
        process.stdin.on("data", data => sort(null, data));
    }
}

function sort(err, data) {
    if (err) {
        console.error(`File not found: ${err.path}`);
        process.exit(1);
    }

    const cities = JSON.parse(data);
    const city_names = cities
        .map(city => city.name)
        .filter(name =>
            !name.startsWith("Stacje Sponsorskie")
            && !name.startsWith("Orlen"));
    const sorted = city_names.sort(
        (a, b) => a.localeCompare(b, "pl"));
    console.log(sorted.join(", "));
    console.log(`Liczba miast: ${sorted.length}`);
}

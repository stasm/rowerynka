// vim: ts=4 et sts=4 sw=4

import { get_stations } from "./nextbike.js";
import { send } from "./messenger.js";
import { map_dirs_url } from "./google.js";
import { map_image_url } from "./bing.js";
import { random_gif } from "./giphy.js";
import { distance } from "./util.js";
import _ from "./l10n.js";

export async function send_text(recipient_id, text) {
    const message = {
        messaging_type: "RESPONSE",
        recipient: {
            id: recipient_id
        },
        message: {
            text,
        }
    };

    console.log("<<< Text");
    console.log(JSON.stringify(message));
    return await send(message);
}

export async function send_question(recipient_id, text, quick_replies) {
    const message = {
        messaging_type: "RESPONSE",
        recipient: {
            id: recipient_id
        },
        message: {
            text,
            quick_replies
        }
    };

    console.log("<<< Question");
    console.log(JSON.stringify(message));
    return await send(message);
}

export async function send_confirm(recipient_id, text) {
    const quick_replies = [
        {
            content_type: "text",
            title: _("thread-yes"),
            payload: "USER_YES"
        },
        {
            content_type: "text",
            title: _("thread-no"),
            payload: "USER_NO"
        },
        {
            content_type: "text",
            title: _("thread-cancel"),
            payload: "USER_CANCEL"
        }
    ];

    return await send_question(recipient_id, text, quick_replies);
}

export async function send_random_gif(recipient_id) {
    const url = await random_gif();
    const message = {
        messaging_type: "RESPONSE",
        recipient: {
            id: recipient_id
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url
                }
            },
        }
    };

    console.log("<<< GIF");
    console.log(JSON.stringify(message));
    return await send(message);
}

function to_element(origin, station) {
    const orig = `${origin.latitude},${origin.longitude}`;
    const dest = `${station.latitude},${station.longitude}`;

    const { name, bikes = 0 } = station;

    return {
        title: name,
        subtitle: _("station-detail", {
            bikes,
            distance: distance(origin, station, 10)
        }),
        image_url: map_image_url(dest, orig, bikes.toString(10)),
        buttons: [{
            type: "web_url",
            title: _("open-map"),
            url: map_dirs_url(orig, dest)
        }]
    };
}

function non_empty(station) {
    return station.bikes > 0;
}

function min_bikes_offset(stations, min_bikes) {
    let tally = 0;

    for (const [index, station] of stations.entries()) {
        tally += station.bikes;

        if (tally >= min_bikes) {
            return index + 1;
        }
    }

    return stations.length;
}

export async function send_locations(recipient_id, origin) {
    await typing_on(recipient_id);
    try {
        var stations = await get_stations(origin, 2000);
    } catch (err) {
        console.error("--- Error: ", err.message);
        return await send_text(recipient_id, _("generic-error"));
    } finally {
        await typing_off(recipient_id);
    }

    if (stations.length === 0) {
        return await send_text(recipient_id, _("no-stations-available"));
    }

    // Start with stations with at least one bike.
    const with_bikes = stations.filter(non_empty);

    if (with_bikes.length === 0) {
        return await send_text(recipient_id, _("no-bikes-available"));
    }

    // Messenger's Generic Templates can show up to 10 elements.
    const closest_stations = with_bikes.slice(0, 10);
    // Maybe we don't need all 10 stations to show a helpful number of bikes?
    const offset = min_bikes_offset(closest_stations, 10);
    // Still, show at least 3 stations.
    const best_stations = closest_stations.slice(0, Math.max(3, offset));

    const elements = best_stations.map(station => to_element(origin, station));

    const message = {
        messaging_type: "RESPONSE",
        recipient: {
            id: recipient_id
        },
        message: {
            quick_replies: [
                {
                    "content_type": "text",
                    "title": _("quick-reply-thanks"),
                    "payload": "USER_THANKS"
                }
            ],
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    image_aspect_ratio: "horizontal",
                    elements
                }
            }
        }
    };

    console.log("<<< Stations");
    console.log(JSON.stringify(message));
    return await send(message);
}

async function typing_on(recipient_id) {
    const message = {
        recipient: {
            id: recipient_id
        },
        sender_action: "typing_on"
    };

    return await send(message);
}

async function typing_off(recipient_id) {
    const message = {
        recipient: {
            id: recipient_id
        },
        sender_action: "typing_off"
    };

    return await send(message);
}

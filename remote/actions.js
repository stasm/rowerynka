// vim: ts=4 et sts=4 sw=4

import { get_stations } from "./nextbike";
import { send } from "./messenger";
import { map_image_url, map_dirs_url } from "./google";
import { random_gif } from "./giphy";
import { distance } from "./util";
import _ from "./l10n";

export async function send_text(recipient_id, text) {
    const message = {
        recipient: {
            id: recipient_id
        },
        message: {
            text,
            quick_replies: [
                {
                    "content_type": "location",
                }
            ],
        }
    };

    console.log("<<< Text");
    console.log(JSON.stringify(message));
    return await send(message);
}

export async function send_random_gif(recipient_id) {
    const url = await random_gif();
    const message = {
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
            quick_replies: [
                {
                    "content_type": "location",
                }
            ],
        }
    };

    console.log("<<< GIF");
    console.log(JSON.stringify(message));
    return await send(message);
}

function to_element(origin, station) {
    const orig = `${origin.latitude},${origin.longitude}`;
    const dest = `${station.latitude},${station.longitude}`;

    return {
        title: station.name,
        subtitle: _("station-detail", {
            bikes: station.bikes,
            distance: distance(origin, station, 10)
        }),
        image_url: map_image_url(dest),
        buttons: [{
            type: "web_url",
            title: _("open-map"),
            url: map_dirs_url(orig, dest)
        }, {
            "type": "element_share"
        }]
    };
}

function non_empty(station) {
    return station.bikes > 0;
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

    const with_bikes = stations.filter(non_empty).slice(0, 10);

    if (with_bikes.length === 0) {
        return await send_text(recipient_id, _("no-bikes-available"));
    }

    const elements = with_bikes.map(station => to_element(origin, station));

    const message = {
        recipient: {
            id: recipient_id
        },
        message: {
            quick_replies: [
                {
                    "content_type": "text",
                    "title": _("quick-reply-thanks"),
                    "payload": "USER_THANKS"
                }, {
                    "content_type": "location",
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

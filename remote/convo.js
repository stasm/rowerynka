// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";
import { get_stations } from "./nextbike";
import { send } from "./messenger";
import { distance } from "./util";
import _ from "./l10n";

const { PLACES_API_URL, PLACES_API_KEY, STATIC_URL } = process.env;

export default async function handle_event(evt) {
    if (evt.message) {
        return received_message(evt);
    }

    if (evt.postback) {
        return received_postback(evt);
    }

    console.error("--- Unknown event: ", evt);
}

async function received_message(event) {
    const { sender: { id: sender_id }, message } = event;

    console.log(">>> Message");
    console.log(JSON.stringify(message));

    if (message.text) {
        return send_text(sender_id, _("unknown-message"));
    }

    if (message.attachments) {
        const [attachment] = message.attachments;
        switch (attachment.type) {
            case "location": {
                const { lat, long } = attachment.payload.coordinates;
                const origin = {
                    latitude: lat,
                    longitude: long,
                };
                return send_locations(sender_id, origin);
            }
            case "image":
                return send_gif(sender_id, "highfive.gif");
            default:
                return send_text(sender_id, _("unknown-attachment"));
        }
    }
}

async function received_postback(event) {
    const {
        sender: { id: sender_id },
        postback: { payload }
    } = event;

    console.log(">>> Postback");
    console.log(JSON.stringify(payload));

    if (payload === "USER_GET_STARTED") {
        await send_text(sender_id, _("welcome-new-user"));
    } else {
        await send_text(sender_id, _("unknown-postback"));
    }
}

async function send_text(recipient_id, text) {
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
    await send(message);
}

async function send_gif(recipient_id, filename) {
    var message = {
        recipient: {
            id: recipient_id
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: `${STATIC_URL}/${filename}`
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
    await send(message);
}

function to_element(origin, station) {
    const orig = `${origin.latitude},${origin.longitude}`;
    const dest = `${station.latitude},${station.longitude}`;

    const image_query = {
        key: PLACES_API_KEY,
        size: "500x500",
        maptype: "roadmap",
        style: "feature:poi.business|visibility:off",
        markers: dest
    };
    const map_url =
        `https://www.google.com/maps/dir/${orig}/${dest}` +
        // Specify walking mode.
        "/data=!4m2!4m1!3e2";

    return {
        title: station.name,
        subtitle: _("station-detail", {
            bikes: station.bikes,
            distance: distance(origin, station, 10)
        }),
        image_url: `${PLACES_API_URL}?${stringify(image_query)}`,
        buttons: [{
            type: "web_url",
            title: _("open-map"),
            url: map_url,
        }, {
            "type": "element_share"
        }]
    };
}

function non_empty(station) {
    return station.bikes > 0;
}

async function send_locations(recipient_id, origin) {
    await typing_on(recipient_id);
    try {
        var stations = await get_stations(origin, 2000);
    } catch (err) {
        console.error("--- Error: ", err.message);
        return send_text(recipient_id, _("generic-error"));
    } finally {
        await typing_off(recipient_id);
    }

    if (stations.length === 0) {
        return send_text(recipient_id, _("no-stations-available"));
    }

    const with_bikes = stations.filter(non_empty).slice(0, 10);

    if (with_bikes.length === 0) {
        return send_text(recipient_id, _("no-bikes-available"));
    }

    const elements = with_bikes.map(station => to_element(origin, station));

    const message = {
        recipient: {
            id: recipient_id
        },
        message: {
            quick_replies: [
                {
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
    await send(message);
}

async function typing_on(recipient_id) {
    const message = {
        recipient: {
            id: recipient_id
        },
        sender_action: "typing_on"
    };

    await send(message);
}

async function typing_off(recipient_id) {
    const message = {
        recipient: {
            id: recipient_id
        },
        sender_action: "typing_off"
    };

    await send(message);
}

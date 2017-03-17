// vim: ts=4 et sts=4 sw=4

import { stringify } from "querystring";
import { get_stations } from "./nextbike";
import { send } from "./messenger";
import { distance } from "./util";
import _ from "./l10n";

const { PLACES_API_URL, PLACES_API_KEY } = process.env;

export default async function handle_event(evt) {
    if (evt.message) {
        return received_message(evt);
    }

    if (evt.postback) {
        return received_postback(evt);
    }

    console.log("--- Unknown event: ", evt);
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
        if (attachment.type === "location") {
            const { lat, long } = attachment.payload.coordinates;
            const origin = {
                latitude: lat,
                longitude: long,
            };
            return send_locations(sender_id, origin);
        }

        return send_text(sender_id, _("unknown-attachment"));
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

function to_element(origin, station) {
    const orig = `${origin.latitude},${origin.longitude}`;
    const dest = `${station.latitude},${station.longitude}`;

    const image_query = {
        key: PLACES_API_KEY,
        size: "500x500",
        maptype: "roadmap",
        style: [
            "feature:transit|visibility:off",
            "feature:poi|visibility:off",
            "feature:poi.park|visibility:on"
        ],
        markers: dest
    };

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
            url: `https://www.google.com/maps/dir/${orig}/${dest}`,
        }, {
            "type": "element_share"
        }]
    };
}


async function send_locations(recipient_id, origin) {
    function non_empty(station) {
        return station.bikes > 0;
    }

    function by_distance(a, b) {
        return distance(origin, a) - distance(origin, b);
    }

    await typing_on(recipient_id);
    const stations = await get_stations(origin, 2000);
    const closest = stations.filter(non_empty).sort(by_distance).slice(0, 10);
    const elements = closest.map(station => to_element(origin, station));
    await typing_off(recipient_id);

    if (elements.length === 0) {
        return send_text(recipient_id, _("no-bikes-available"));
    }

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

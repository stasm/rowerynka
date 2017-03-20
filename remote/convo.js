// vim: ts=4 et sts=4 sw=4

import { parse_text } from "./text";
import { get_stations } from "./nextbike";
import { send } from "./messenger";
import { map_image_url, map_dirs_url, guess_origin } from "./google";
import { distance, random_int } from "./util";
import _ from "./l10n";

const { STATIC_URL } = process.env;

export default async function handle_event(evt) {
    if (evt.message) {
        return await received_message(evt);
    }

    if (evt.postback) {
        return await received_postback(evt);
    }

    console.error("--- Unknown event: ", evt);
}

async function received_message(event) {
    const { sender: { id: sender_id }, message } = event;

    console.log(">>> Message");
    console.log(JSON.stringify(message));

    if (message.quick_reply) {
        const { payload } = message.quick_reply;
        switch (payload) {
            case "USER_THANKS":
                const i = random_int(1, 5);
                return await send_text(sender_id, _(`acknowledgement-${i}`));
            default:
                return await send_text(sender_id, _("unknown-quick-reply"));
        }
    }

    if (message.text) {
        const command = parse_text(message.text);
        switch (command) {
            case "TEXT_THANKS":
                const i = random_int(1, 5);
                return await send_text(sender_id, _(`acknowledgement-${i}`));
            case "TEXT_HELLO":
                return await send_text(sender_id, _("hello-user"));
            case "TEXT_HELP":
                return await send_text(sender_id, _("help"));
            case "TEXT_START":
                return await send_text(sender_id, _("welcome-new-user"));
            default: {
                const origin = await guess_origin(message.text);

                if (origin) {
                    return await send_locations(sender_id, origin);
                }

                return await send_text(sender_id, _("unknown-message"));
            }
        }
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
                return await send_locations(sender_id, origin);
            }
            case "image":
                return await send_gif(sender_id, "highfive.gif");
            default:
                return await send_text(sender_id, _("unknown-attachment"));
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

    switch (payload) {
        case "USER_GET_STARTED":
            return await send_text(sender_id, _("welcome-new-user"));
        default:
            return await send_text(sender_id, _("unknown-postback"));
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
    return await send(message);
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

async function send_locations(recipient_id, origin) {
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

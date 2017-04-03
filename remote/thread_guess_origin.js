// vim: ts=4 et sts=4 sw=4

import { send_text, send_confirm, send_locations } from "./actions";
import { get_user_profile } from "./messenger";
import { place_autocomplete, place_detail } from "./google";
import { set_state, get_state, del_state } from "./state";
import patterns from "./patterns";
import _ from "./l10n";

export async function start(user_id, message) {
    await set_state(user_id, { thread_id: "GUESS_ORIGIN", });
    return await goto("BOT_PREDICTING", user_id, message.text);
}

export async function handle_event(event, state) {
    const { sender: { id: user_id } } = event;

    if (event.message) {
        const { message } = event;
        console.log(">>> Message");
        console.log(JSON.stringify(message));

        return await handle_message(user_id, state, message);
    }

    if (event.postback) {
        return await send_text(user_id, _("unknown-postback"));
    }

    console.error("--- Unknown event: ", event);
}

async function handle_message(user_id, state, message) {
    const { stage_id } = state;
    switch (stage_id) {
        case "BOT_PREDICTING":
        case "BOT_SEARCHING":
            return;
        case "USER_RESPOND": {
            if (message.quick_reply) {
                const { payload } = message.quick_reply;
                switch (payload) {
                    case "USER_YES":
                        return await goto("BOT_SEARCHING", user_id);
                    case "USER_NO":
                        return await end(user_id, _("thread-guess-try-again"));
                    case "USER_CANCEL":
                        return await end(user_id, _("thread-guess-nevermind"));
                    default: {
                        const { description } = state;
                        return await goto(
                            "USER_RESPOND", user_id, description
                        );
                    }
                }
            }

            if (message.text) {
                const { text } = message;

                if (patterns.yes.test(text)) {
                    return await goto("BOT_SEARCHING", user_id);
                }

                if (patterns.no.test(text)) {
                    return await end(user_id, _("thread-guess-try-again"));
                }

                if (patterns.cancel.test(text)) {
                    return await end(user_id, _("thread-guess-nevermind"));
                }

                const { description } = state;
                return await goto("USER_RESPOND", user_id, description);
            }

            return await send_confirm(user_id, _("thread-unknown"));
        }
        default:
            return await send_confirm(user_id, _("thread-unknown"));
    }
}

const transitions = {
    BOT_PREDICTING: async function(user_id, text) {
        const [prediction] = await place_autocomplete(text);

        if (!prediction) {
            return await end(user_id, _("thread-guess-no-prediction"));
        }

        const { place_id, description } = prediction;
        await set_state(user_id, { place_id, description });
        return await goto("USER_RESPOND", user_id, description);
    },
    USER_RESPOND: async function(user_id, place) {
        const { gender } = await get_user_profile(user_id);
        return await send_confirm(
            user_id, _("thread-guess-confirm", { gender, place })
        );
    },
    BOT_SEARCHING: async function(user_id) {
        const { place_id } = await get_state(user_id);
        const detail = await place_detail(place_id);

        if (!detail) {
            return await end(user_id, _("generic-error"));
        }

        const { geometry: { location } } = detail;

        const origin = {
            latitude: location.lat,
            longitude: location.lng,
        };

        await del_state(user_id);
        return await send_locations(user_id, origin);
    },
};

async function goto(stage_id, user_id, ...args) {
    await set_state(user_id, { stage_id });
    const fn = transitions[stage_id];

    if (fn) {
        return await fn(user_id, ...args);
    }

    return await send_text(user_id, _("generic-error"));
}

async function end(user_id, text) {
    await del_state(user_id);

    if (text) {
        return await send_text(user_id, text);
    }
}

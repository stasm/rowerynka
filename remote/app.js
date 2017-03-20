// vim: ts=4 et sts=4 sw=4

import body_parser from "body-parser";
import crypto from "crypto";
import express from "express";

import { get_state } from "./state";
import { get_thread } from "./threads";

const { MESSENGER_APP_SECRET, MESSENGER_VALIDATION_TOKEN } = process.env;

export default function create_app() {
    const app = express();
    app.set("port", process.env.PORT);
    app.use(body_parser.json({ verify: verify_request }));

    app.get("/webhook", webhook_get);
    app.post("/webhook", webhook_post);

    return app;
}

function webhook_get(req, res) {
    if (req.query["hub.mode"] === "subscribe" &&
        req.query["hub.verify_token"] === MESSENGER_VALIDATION_TOKEN) {
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.error("Validation failed");
        res.sendStatus(403);
    }
}

function webhook_post(req, res) {
    const { body } = req;

    if (body.object !== "page") {
        return res.sendStatus(500);
    }

    for (const page of body.entry) {
        page.messaging.forEach(handle_event);
    }

    res.sendStatus(200);
}

async function handle_event(event) {
    const { sender: { id: sender_id } } = event;
    const current_state = get_state(sender_id);
    const active_thread = current_state
        ? get_thread(current_state.thread_id)
        : get_thread("THREAD_DEFAULT");

    return await active_thread.handle_event(event, current_state);
}

function verify_request(req, res, buf) {
    var signature = req.headers["x-hub-signature"];

    if (!signature) {
        throw new Error("Signature validation failed");
    }

    const elements = signature.split("=");
    const signature_hash = elements[1];

    const expected_hash = crypto
        .createHmac("sha1", MESSENGER_APP_SECRET)
        .update(buf)
        .digest("hex");

    if (signature_hash !== expected_hash) {
        throw new Error("Signature validation failed");
    }
}

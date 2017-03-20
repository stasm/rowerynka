// vim: ts=4 et sts=4 sw=4

import * as default_thread from "./thread_default";
import * as guess_origin from "./thread_guess_origin";

const THREADS = {
    THREAD_DEFAULT: default_thread,
    GUESS_ORIGIN: guess_origin
};

export function get_thread(thread_id) {
    return THREADS[thread_id] || default_thread;
}

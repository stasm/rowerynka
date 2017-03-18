// vim: ts=4 et sts=4 sw=4

const re_thanks = /dzi[eę][nm]?k/i;
const re_hello = /hej|czesc|cześć|ha+lo/i;
const re_help = /help|pomoc|jak.*działa/i;
const re_start = /rozpocznij|start|go/i;

export function parse_text(text) {
    if (re_thanks.test(text)) {
        return "TEXT_THANKS";
    }

    if (re_hello.test(text)) {
        return "TEXT_HELLO";
    }

    if (re_help.test(text)) {
        return "TEXT_HELP";
    }

    if (re_start.test(text)) {
        return "TEXT_START";
    }

    return "TEXT_UNKNOWN";
}

// vim: ts=4 et sts=4 sw=4

const re_yes = /^(tak|ta|t)$/i;
const re_no = /^(nie|ni|n)$/i;
const re_cancel = /^nie ?wa[zż]ne$/i;
const re_thanks = /^dzi[eę][nm]?[kx](i|s|uje|uję)?$/i;
const re_hello = /^(hej|czesc|cześć|ha+lo+)$/i;
const re_help = /^(\?|pomocy?|jak.*działa)$/i;
const re_start = /^(rozpocznij|start)$/i;

export function parse_text(text) {
    if (re_yes.test(text)) {
        return "TEXT_YES";
    }

    if (re_no.test(text)) {
        return "TEXT_NO";
    }

    if (re_cancel.test(text)) {
        return "TEXT_CANCEL";
    }

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

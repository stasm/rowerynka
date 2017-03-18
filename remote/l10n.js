// vim: ts=4 et sts=4 sw=4

import "fluent-intl-polyfill";
import { MessageContext } from "fluent";

const cx = new MessageContext("pl");
cx.addMessages(`

welcome-new-user =
    Witaj na pokładzie! Prześlij mi swoje położenie,
    a poszukam najbliższego wolnego roweru Veturilo.

unknown-message =
    Nie rozumiem.

unknown-attachment =
    Nie rozumiem.

unknown-postback =
    Nie rozumiem.

no-stations-available =
    W pobliżu nie ma żadnych stacji rowerów.

no-bikes-available =
    W pobliżu nie ma żadnych dostępnych rowerów.

station-detail =
    { $bikes ->
        [0] Brak wolnych rowerów
        [one] Ostatni wolny rower, { $distance } m
        [few] { $bikes } wolne rowery, { $distance } m
       *[many] { $bikes } wolnych rowerów, { $distance } m
    }

open-map =
    Pokaż trasę
`);

export default function _(id, args) {
    const msg = cx.messages.get(id);

    if (!msg) {
        return id;
    }

    return cx.format(msg, args).replace("\n", " ");
}

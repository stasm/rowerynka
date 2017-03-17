// vim: ts=4 et sts=4 sw=4

import create_app from "./app";

const app = create_app();

app.listen(app.get("port"), function() {
    console.log("--- Running on port", app.get("port"));
});

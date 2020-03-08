#!/bin/bash

if [[ -z "${PAGE_ACCESS_TOKEN}" ]]; then
    echo "PAGE_ACCESS_TOKEN is not defined."
    exit 1
fi

if [[ ! $1 ]]; then
    echo "Path to the JSON file required."
    exit 1
fi

curl -X POST -H "Content-Type: application/json" -d @$1 \
  "https://graph.facebook.com/v6.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}"

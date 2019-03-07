#!/bin/bash

APP=$1
PORT=$2

docker run -it -p "$PORT:3000" --rm --restart always --name "$APP" -d "$APP" -v /opt/.data:/opt/.data

#!/bin/bash

docker stop users
docker rm users
./slave_build.sh users
./slave_start.sh users 3000

# Users Cubed S3

This is full user management service API. as [original version](https://github.com/TalaikisInc/users-cubed) is easily extensible, this version is made for S3 instead of local hosts' json store.

## Features

* Usrr registration, login, edit, destroy
* Same CRUD for tokens
* Minimal referral system
* Account confirmations
* Password reset
* Internationalized

## TODO

* add zip code
* add country code checker
* Finish phome confirm
* add DOB
* improve phone (from frontend now is tel-country-code, tel-national)
* add avatar/ images (tied to upload-service-s3)
* Logs
* Move into async/await
* Data caching?
* Penetration testing
* Finish i18n
* Role system
* Tests
* Cleanup for left data in S3

## Install

```bash
npm i
amplify init
amplify add storage
amplify push
```

## Run

```bash
npm i
npm run start
```

## Requirements

* Passwords > 11 chars

## Routes

There is only one '/' route that accepts only POST requests with defined actions. List of actions is listed on Postam collection.

## Tests

```bash
npm run test
```

## Deployment

Use slave_build.sh and slave_start.sh, data will be mounted on /opt/.data

## Licence

GPL v3.0

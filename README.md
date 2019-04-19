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

* user edit email validaiton
* global email pre-validation using dns
* Finish phone confirm
* Finish json validators
* Finish i18n
* Move into async/await (?)
* Response caching (?)
* Penetration testing
* Role system
* Tests
* Cleanup for old data in S3
* Move to Lambda (?)
* TOKEN_CREATE_SOCIAL
* USER_CREATE_SOCIAL

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

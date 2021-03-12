# Roamgram

Send notes to Roam Research using a Telegram Bot.

### Telegram Setup

- Open Telegram
- Start a conversation with [@userinfobot](https://t.me/userinfobot)
- Press start
- Copy the `id` property from the message it sends, this is your `TELEGRAM_ADMIN_ID`

- Now create a bot using the instructions [here](https://core.telegram.org/bots#6-botfather)
- At the end of the process you should get a token to access the HTTP API, this is your `TELEGRAM_BOT_TOKEN`

### Node.js Setup

- `git clone git://github.com/arn4v/roamgram -b main`
- Install Node.js v14.15.5 (this is what I tested with but any version v12+ should work)
- `cd roamgram`
- Copy `example.env` to `.env` using `cp example.env .env`
- Edit .env to add the following details:
  ```
  TELEGRAM_BOT_TOKEN=
  TELEGRAM_ADMIN_ID=
  ROAM_EMAIL=
  ROAM_PASSWORD=
  ROAM_GRAPH=
  ```
- Run `npm start`
- Now send `/add <your note>` to your bot on Telegram and see it show up on your Roam Daily Notes Page

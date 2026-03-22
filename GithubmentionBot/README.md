# GitHub Mention Bot

A simple Rocket.Chat App that replies when someone mentions your GitHub username in a channel

## How it works

1. Use `/khizarshah01 on` or `off` to toggle the bot.
2. When the bot is ON, anytime someone mentions `@khizarshah01` in a channel, the bot sends an ephemeral message back saying: *"Thank you for mentioning me, @[their_username]"*.
3. **External Logger**: You can also add a webhook URL in the App Settings. If you do, the bot will `POST` the mentioning userid and message directly to your URL instead

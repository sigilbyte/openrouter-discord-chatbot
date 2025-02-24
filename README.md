# OpenRouter Discord chatbot | Integrate OpenRouter API with Discord chats seamlessly 🤖
![Version](https://img.shields.io/badge/version-v0.0.1--alpha-blue)
![Status](https://img.shields.io/badge/status-prerelease-yellow)


a *minimal*, *open source* Discord chat bot with chat context and seamless switching of models enabled by the OpenRouter API. written in typescript, using the bun runtime and bun tests. 

## features so far

| command              | description                                        |
|----------------------|----------------------------------------------------|
| `!ai <message>`      | Command to chat with the AI model                  |
| `!ai-model <model-id>` | Command to switch between OpenRouter supported models |
| `!ai-model list`    | Command to list available OpenRouter model-ids    |

- uses chat history (last 50 messages in current channel by default) for context
- automatic message chunking for long responses
- rate limiting protection to prevent spam

**WORK IN PROGRESS PHASE** - this is a very early version, feel free to create PRs and issues. I will be adding more features and fixing bugs myself. in case this is getting more traction, I surely welcome every support 🤗

## what you need

- [bun](https://bun.sh) runtime
- Discord bot token
- OpenRouter API Key

## how to install

1. clone the repository:
```bash
git clone https://github.com/sigilbyte/openrouter-discord-chatbot.git
cd openrouter-discord-chatbot
```

2. install dependencies using bun:
```bash
bun install
```

3. rename the `.envexample` file to `.env` and fill in your API keys:
```env
OPENROUTER_API_KEY=your_openrouter_api_key
DISCORD_BOT_TOKEN=your_discord_bot_token
```
to get your OpenRouter API Key, sign up on [OpenRouter](https://openrouter.ai).
to get your Discord bot token, follow the instructions below.

## get Discord bot token
1. create an application in your [Discord Developer Portal](https://discord.com/developers/applications):
![create app](assets/images/image.png)
2. configure bot installation in installation tab:
![bot installation](assets/images/image-1.png)
Copy the **Install link** for later.
3. configure bot settings & create your bot token:
    - Enable MESSAGE CONTENT INTENT    
![bot settings](assets/images/image-2.png)
    - Click 'Reset Token' to generate your `DISCORD_BOT_TOKEN`:
    ![bot token](assets/images/image-3.png)

## how to use the bot
after setting up your bot in the discord developer portal, open the **Install link** you copied earlier to add the bot to your server.
### run bot script:
open your terminal and run:
```bash
cd openrouter-discord-bot
bun run src/index.ts
```

inside the discord server where your bot has been added, use the following commands:
### chat with bot:
```
!ai <your message>
```
### switch model:
```
!ai-model <model_id>
```
### list available model ids:
```
!ai-model list
```


## what is planned
integration of all **OpenRouter functionalities** in a user-friendly way.
- [ ] provider routing
- [ ] structured outputs
- [ ] message transforms
- [ ] web search
- [ ] function calling
...

additional improvements for user-friendliness and integration:
- [ ] message streaming
- [ ] processing of attachments
- [ ] token count and price display
- [ ] docker containerization

🚨🚨 **note**: this is a wip and the code is not yet optimized for production use. feel free to contact me on [X/Twitter](https://x.com/sigilbyte) to discuss ideas or contribute to the project. 
I want to build in public on purpose to share my progress and meet motivated peers on the way to collaborate with.🚨🚨

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

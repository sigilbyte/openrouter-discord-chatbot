# OpenRouter Discord Chatbot

A Discord bot in development phase that enables interaction with all OpenRouter supported AI models through the OpenRouter API. the bot allows users to chat with different AI models and switch between them seamlessly.

## features so far

- chat with AI models using the `!ai` command
- switch between different AI models using `!ai-model` command
- view available models with `!ai-model print`
- rate limiting protection to prevent spam
- maintains chat history context for more coherent conversations
- automatic message chunking for long responses


## prerequisites

- [Bun](https://bun.sh) runtime
- Discord Bot Token
- OpenRouter API Key
- OpenRouter HTTP Referer URL

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/openrouter-discord-chatbot.git
cd openrouter-discord-chatbot
```

2. Install dependencies using Bun:
```bash
bun install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DISCORD_BOT_TOKEN=your_discord_bot_token
OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Create an `openrouter_ids.txt` file containing the list of allowed model IDs (one per line). Example:
```
"openai/o3-mini"
"anthropic/claude-3.5-sonnet"
"google/gemini-2.0-pro-exp-02-05:free"
```

## Discord Bot Setup

[Your Discord bot setup instructions will go here]

## Configuration

### Environment Variables

- `DISCORD_BOT_TOKEN`: Your Discord bot's token
- `OPENROUTER_API_KEY`: Your OpenRouter API key


### Rate Limiting

The bot includes rate limiting to prevent spam:
- Default cooldown: 5 seconds between requests
- Configurable in `src/index.ts` by modifying `RATE_LIMIT_SECONDS`

## Usage

### Available Commands

1. chat with bot:
```
!ai <your message>
```

2. switch model:
```
!ai-model <model_id>
```

3. print available model ids:
```
!ai-model print
```


## Development

To run the bot in development mode:
```bash
bun run src/index.ts
```

## License

MIT License

Copyright (c) 2024

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

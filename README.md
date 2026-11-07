# dsh-global-rules

Edit your user-global rules file `$DSH_HOME/AGENTS.md` (default `~/.dsh/AGENTS.md`) from the DeepSeek Harness web settings panel.

## Features

- A new **Global rules** settings tab (labelled 「全局规则」): opening it loads the current content of the global rules file and shows the path it resolved to.
- Path resolution matches the harness: a non-blank `$DSH_HOME` wins, otherwise `~/.dsh` (the same rule the built-in `dsh-agent-instructions` follows, so you always edit the file that is actually in effect).
- Edit and save with immediate effect: **new sessions** use the new rules on their first step.
- Features a **"Show in Folder"** button to quickly locate the rule file in your system's file manager.
- Saving creates the file when it does not exist yet.

## Requirements

- DeepSeek Harness (`dsh`) with the `web` profile.

## Install

Clone this repository and install it as a local plugin:

```sh
dsh plugin --profile web add /path/to/dsh-global-rules
```

Restart `dsh web`, then open **Settings → Global rules**.

## Usage

1. Open **Settings → Global rules**.
2. Edit the rules (Markdown syntax).
3. Click **Save**.

After saving, new sessions will immediately apply these rules on their first step.

## How it works

- **Host** (`lib/index.js`): registers a Fetch route `/api/global-rules` to read/write the rules file. It uses the `ctx.connection.fetch` service to ensure authentication and security within the harness environment.
- **Client** (`lib/client.js`): a `window.__ModuleLoader__` bundle that injects the **Global rules** page into the DSH settings panel.

## License

[MIT](LICENSE)

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)

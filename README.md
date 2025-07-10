<h1 align="center">Niteo Code CLI</h1>
<p align="center">Lightweight coding agent that runs in your terminal</p>

<p align="center"><code>npm install -g @niteotech/code</code></p>

This is the home of the **Niteo Code CLI**, which is a coding agent powered by Azure OpenAI that runs locally on your computer. It's a customized version of the OpenAI Codex CLI optimized for use with Azure OpenAI services.

<!-- ![Niteo Code CLI demo GIF using: niteo-code "explain this codebase to me"](./.github/demo.gif) -->

---

<details>
<summary><strong>Table of contents</strong></summary>

<!-- Begin ToC -->

- [Experimental technology disclaimer](#experimental-technology-disclaimer)
- [Quickstart](#quickstart)
  - [OpenAI API Users](#openai-api-users)
  - [OpenAI Plus/Pro Users](#openai-pluspro-users)
- [Why Niteo Code CLI?](#why-niteo-code-cli)
- [Security model & permissions](#security-model--permissions)
  - [Platform sandboxing details](#platform-sandboxing-details)
- [System requirements](#system-requirements)
- [CLI reference](#cli-reference)
- [Memory & project docs](#memory--project-docs)
- [Non-interactive / CI mode](#non-interactive--ci-mode)
- [Model Context Protocol (MCP)](#model-context-protocol-mcp)
- [Tracing / verbose logging](#tracing--verbose-logging)
- [Recipes](#recipes)
- [Installation](#installation)
  - [DotSlash](#dotslash)
- [Configuration](#configuration)
- [FAQ](#faq)
- [Zero data retention (ZDR) usage](#zero-data-retention-zdr-usage)
- [Niteo Code CLI open source fund](#niteo-code-cli-open-source-fund)
- [Contributing](#contributing)
  - [Development workflow](#development-workflow)
  - [Writing high-impact code changes](#writing-high-impact-code-changes)
  - [Opening a pull request](#opening-a-pull-request)
  - [Review process](#review-process)
  - [Community values](#community-values)
  - [Getting help](#getting-help)
  - [Contributor license agreement (CLA)](#contributor-license-agreement-cla)
    - [Quick fixes](#quick-fixes)
  - [Releasing `niteo-code`](#releasing-niteo-code)
- [Security & responsible AI](#security--responsible-ai)
- [License](#license)

<!-- End ToC -->

</details>

---

## Experimental technology disclaimer

Niteo Code CLI is an experimental project under active development. It is not yet stable, may contain bugs, incomplete features, or undergo breaking changes. We're building it in the open with the community and welcome:

- Bug reports
- Feature requests
- Pull requests
- Good vibes

Help us improve by filing issues or submitting PRs (see the section below for how to contribute)!

## Quickstart

Install globally:

```shell
npm install -g @niteotech/code
```

Or go to the [latest GitHub Release](https://github.com/heberpereiraniteo/codex/releases/latest) and download the appropriate binary for your platform.

### Azure OpenAI Users

This version is pre-configured to work with Azure OpenAI. You can configure it interactively:

```shell
niteo-code --setup-azure
```

The setup wizard will guide you through:
1. Entering your Azure OpenAI API key
2. Setting your Azure OpenAI base URL
3. Configuring your model deployment name
4. Setting the API version

Alternatively, you can set environment variables manually:

```shell
export AZURE_OPENAI_API_KEY="your-api-key-here"
export AZURE_OPENAI_BASE_URL="https://your-resource.openai.azure.com"
export AZURE_OPENAI_MODEL="your-model-deployment"
export AZURE_OPENAI_API_VERSION="2024-10-01-preview"
```

> [!NOTE]
> These commands set the keys only for your current terminal session. You can add the `export` lines to your shell's configuration file (e.g., `~/.zshrc`), or use the setup wizard which saves the configuration automatically.

### OpenAI API Users (Alternative)

If you prefer to use OpenAI directly instead of Azure OpenAI, set your OpenAI API key:

```shell
export OPENAI_API_KEY="your-api-key-here"
```

Then run with the OpenAI provider:

```shell
niteo-code --provider openai
```

<details>
<summary><strong>Use <code>--profile</code> to use other models</strong></summary>

Niteo Code CLI also allows you to use other providers that support the OpenAI Chat Completions (or Responses) API.

To do so, you must first define custom [providers](./codex-cli/README.md#configuration-guide) in `~/.niteo-code/config.json`. For example, the provider for a standard Ollama setup would be defined as follows:

```json
{
  "providers": {
    "ollama": {
      "name": "Ollama",
      "baseURL": "http://localhost:11434/v1"
    }
  }
}
```

The `baseURL` will have `/chat/completions` appended to it to build the full URL for the request.

For providers that also require an `Authorization` header of the form `Bearer: SECRET`, an `envKey` can be specified, which indicates the environment variable to read to use as the value of `SECRET` when making a request:

```json
{
  "providers": {
    "openrouter": {
      "name": "OpenRouter",
      "baseURL": "https://openrouter.ai/api/v1",
      "envKey": "OPENROUTER_API_KEY"
    }
  }
}
```

Azure OpenAI is pre-configured in this version:

```json
{
  "provider": "azure",
  "providers": {
    "azure": {
      "name": "Azure OpenAI",
      "baseURL": "https://your-resource.openai.azure.com",
      "envKey": "AZURE_OPENAI_API_KEY"
    }
  }
}
```

Once you have defined a provider you wish to use, you can configure it as your default provider:

```json
{
  "provider": "azure"
}
```

</details>
<br />

Run interactively:

```shell
niteo-code
```

Or, run with a prompt as input (and optionally in `Full Auto` mode):

```shell
niteo-code "explain this codebase to me"
```

```shell
niteo-code --full-auto "create the fanciest todo-list app"
```

That's it - Niteo Code will scaffold a file, run it inside a sandbox, install any
missing dependencies, and show you the live result. Approve the changes and
they'll be committed to your working directory.

---

## Why Niteo Code CLI?

Niteo Code CLI is built for developers who already **live in the terminal** and want
ChatGPT-level reasoning **plus** the power to actually run code, manipulate
files, and iterate - all under version control. In short, it's _chat-driven
development_ that understands and executes your repo.

- **Zero setup** - configured for Azure OpenAI with interactive setup wizard!
- **Full auto-approval, while safe + secure** by running network-disabled and directory-sandboxed
- **Multimodal** - pass in screenshots or diagrams to implement features ✨

And it's **fully open-source** so you can see and contribute to how it develops!

---

## Security model & permissions

Niteo Code CLI lets you decide _how much autonomy_ you want to grant the agent. The following options can be configured independently:

- `approval_policy` determines when you should be prompted to approve whether Niteo Code CLI can execute a command
- `sandbox` determines the _sandbox policy_ that Niteo Code CLI uses to execute untrusted commands

By default, Niteo Code CLI runs with `approval_policy = "untrusted"` and `sandbox.mode = "read-only"`, which means that:

- The user is prompted to approve every command not on the set of "trusted" commands built into Niteo Code CLI (`cat`, `ls`, etc.)
- Approved commands are run outside of a sandbox because user approval implies "trust," in this case.

Though running Niteo Code CLI with the `--full-auto` option changes the configuration to `approval_policy = "on-failure"` and `sandbox.mode = "workspace-write"`, which means that:

- Niteo Code CLI does not initially ask for user approval before running an individual command.
- Though when it runs a command, it is run under a sandbox in which:
  - It can read any file on the system.
  - It can only write files under the current directory (or the directory specified via `--cd`).
  - Network requests are completely disabled.
- Only if the command exits with a non-zero exit code will it ask the user for approval. If granted, it will re-attempt the command outside of the sandbox. (A common case is when Niteo Code CLI cannot `npm install` a dependency because that requires network access.)

Again, these two options can be configured independently. For example, if you want Niteo Code CLI to perform an "exploration" where you are happy for it to read anything it wants but you never want to be prompted, you could run Niteo Code CLI with `approval_policy = "never"` and `sandbox.mode = "read-only"`.

### Platform sandboxing details

The mechanism Niteo Code CLI uses to implement the sandbox policy depends on your OS:

- **macOS 12+** uses **Apple Seatbelt** and runs commands using `sandbox-exec` with a profile (`-p`) that corresponds to the `sandbox.mode` that was specified.
- **Linux** uses a combination of Landlock/seccomp APIs to enforce the `sandbox` configuration.

Note that when running Linux in a containerized environment such as Docker, sandboxing may not work if the host/container configuration does not support the necessary Landlock/seccomp APIs. In such cases, we recommend configuring your Docker container so that it provides the sandbox guarantees you are looking for and then running `niteo-code` with `sandbox.mode = "danger-full-access"` (or more simply, the `--dangerously-bypass-approvals-and-sandbox` flag) within your container.

---

## System requirements

| Requirement                 | Details                                                         |
| --------------------------- | --------------------------------------------------------------- |
| Operating systems           | macOS 12+, Ubuntu 20.04+/Debian 10+, or Windows 11 **via WSL2** |
| Git (optional, recommended) | 2.23+ for built-in PR helpers                                   |
| RAM                         | 4-GB minimum (8-GB recommended)                                 |

---

## CLI reference

| Command                              | Purpose                             | Example                              |
| ------------------------------------ | ----------------------------------- | ------------------------------------ |
| `niteo-code`                         | Interactive REPL                    | `niteo-code`                         |
| `niteo-code "..."`                   | Initial prompt for interactive REPL | `niteo-code "fix lint errors"`       |
| `niteo-code -q "..."`                | Non-interactive "quiet mode"        | `niteo-code -q "explain utils.ts"`   |
| `niteo-code --setup-azure`           | Interactive Azure OpenAI setup      | `niteo-code --setup-azure`          |
| `niteo-code completion <bash\|zsh\|fish>` | Print shell completion script   | `niteo-code completion bash`         |

Key flags: `--model/-m`, `--provider/-p`, `--approval-mode/-a`, `--quiet/-q`, `--setup-azure`, and `--notify`.

---

## Memory & project docs

You can give Niteo Code CLI extra instructions and guidance using `AGENTS.md` files. Niteo Code CLI looks for `AGENTS.md` files in the following places, and merges them top-down:

1. `~/.niteo-code/AGENTS.md` - personal global guidance
2. `AGENTS.md` at repo root - shared project notes
3. `AGENTS.md` in the current working directory - sub-folder/feature specifics

---

## Non-interactive / CI mode

Run Niteo Code CLI head-less in pipelines. Example GitHub Action step:

```yaml
- name: Update changelog via Niteo Code CLI
  run: |
    npm install -g @niteotech/code
    export AZURE_OPENAI_API_KEY="${{ secrets.AZURE_OPENAI_API_KEY }}"
    export AZURE_OPENAI_BASE_URL="${{ secrets.AZURE_OPENAI_BASE_URL }}"
    export AZURE_OPENAI_MODEL="${{ secrets.AZURE_OPENAI_MODEL }}"
    niteo-code --full-auto "update CHANGELOG for next release"
```

## Model Context Protocol (MCP)

The Niteo Code CLI can be configured to leverage MCP servers by defining an `mcp_servers` section in `~/.niteo-code/config.json`. For example:

```json
{
  "mcp_servers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "mcp-server"],
      "env": { "API_KEY": "value" }
    }
  }
}
```

> [!TIP]
> It is somewhat experimental, but the Niteo Code CLI can also be run as an MCP _server_ via `niteo-code mcp`. Feel free to play around with it and provide feedback via GitHub issues.

## Tracing / verbose logging

The Niteo Code CLI honors standard logging practices. For detailed logging, you can check the log files in `~/.niteo-code/log/` directory.

```
tail -F ~/.niteo-code/log/niteo-code.log
```

---

## Recipes

Below are a few bite-size examples you can copy-paste. Replace the text in quotes with your own task. See the [prompting guide](https://github.com/heberpereiraniteo/codex/blob/main/codex-cli/examples/prompting_guide.md) for more tips and usage patterns.

| ✨  | What you type                                                                   | What happens                                                               |
| --- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | `niteo-code "Refactor the Dashboard component to React Hooks"`                 | Niteo Code CLI rewrites the class component, runs `npm test`, and shows the diff.   |
| 2   | `niteo-code "Generate SQL migrations for adding a users table"`                | Infers your ORM, creates migration files, and runs them in a sandboxed DB. |
| 3   | `niteo-code "Write unit tests for utils/date.ts"`                              | Generates tests, executes them, and iterates until they pass.              |
| 4   | `niteo-code "Bulk-rename *.jpeg -> *.jpg with git mv"`                         | Safely renames files and updates imports/usages.                           |
| 5   | `niteo-code "Explain what this regex does: ^(?=.*[A-Z]).{8,}$"`                | Outputs a step-by-step human explanation.                                  |
| 6   | `niteo-code "Carefully review this repo, and propose 3 high impact well-scoped PRs"` | Suggests impactful PRs in the current codebase.                            |
| 7   | `niteo-code "Look for vulnerabilities and create a security review report"`    | Finds and explains security bugs.                                          |

---

## Installation

<details open>
<summary><strong>From npm (Recommended)</strong></summary>

```bash
npm install -g @niteotech/code
```

Or go to the [latest GitHub Release](https://github.com/heberpereiraniteo/codex/releases/latest) and download the appropriate binary for your platform.

Admittedly, each GitHub Release contains many executables, but in practice, you likely want one of these:

- macOS
  - Apple Silicon/arm64: `codex-aarch64-apple-darwin.tar.gz`
  - x86_64 (older Mac hardware): `codex-x86_64-apple-darwin.tar.gz`
- Linux
  - x86_64: `codex-x86_64-unknown-linux-musl.tar.gz`
  - arm64: `codex-aarch64-unknown-linux-musl.tar.gz`

Each archive contains a single entry with the platform baked into the name (e.g., `codex-x86_64-unknown-linux-musl`), so you likely want to rename it to `codex` after extracting it.

### DotSlash

The GitHub Release also contains a [DotSlash](https://dotslash-cli.com/) file for the Codex CLI named `codex`. Using a DotSlash file makes it possible to make a lightweight commit to source control to ensure all contributors use the same version of an executable, regardless of what platform they use for development.

</details>

<details>
<summary><strong>Build from source</strong></summary>

```shell
# Clone the repository and navigate to the root of the project.
git clone https://github.com/heberpereiraniteo/codex.git
cd codex/codex-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link for global use
npm link

# Test the CLI
niteo-code "explain this codebase to me"

# After making changes, ensure the code is clean.
npm run format:fix
npm run lint:fix

# Run the tests.
npm test
```

</details>

---

## Configuration

Niteo Code CLI supports a rich set of configuration options documented in [`codex-cli/README.md`](./codex-cli/README.md#configuration-guide).

By default, Niteo Code CLI loads its configuration from `~/.niteo-code/config.json`.

You can also use the interactive setup wizard:

```shell
niteo-code --setup-azure
```

---

## FAQ

<details>
<summary>How do I configure Azure OpenAI?</summary>

This version is pre-configured to work with Azure OpenAI. The easiest way is to use the interactive setup wizard:

```shell
niteo-code --setup-azure
```

The wizard will guide you through all the necessary steps and save the configuration automatically.

Alternatively, you can set environment variables manually:

```shell
export AZURE_OPENAI_API_KEY="your-api-key"
export AZURE_OPENAI_BASE_URL="https://your-resource.openai.azure.com"
export AZURE_OPENAI_MODEL="your-model-deployment"
export AZURE_OPENAI_API_VERSION="2024-10-01-preview"
```

</details>

<details>
<summary>What if I see "Azure OpenAI not configured"?</summary>

This message appears when the CLI can't find Azure OpenAI configurations. Run the setup wizard:

```shell
niteo-code --setup-azure
```

The wizard will configure everything automatically for you.

</details>

<details>
<summary>OpenAI released a model called Codex in 2021 - is this related?</summary>

In 2021, OpenAI released Codex, an AI system designed to generate code from natural language prompts. That original Codex model was deprecated as of March 2023. This CLI tool is based on the OpenAI Codex CLI but has been customized for use with Azure OpenAI services.

</details>

<details>
<summary>Which models are supported?</summary>

Any model available with [Responses API](https://platform.openai.com/docs/api-reference/responses). The default is `o4-mini`, but pass `--model gpt-4.1` or set `model: gpt-4.1` in your config file to override.

</details>
<details>
<summary>Why does <code>o3</code> or <code>o4-mini</code> not work for me?</summary>

It's possible that your [API account needs to be verified](https://help.openai.com/en/articles/10910291-api-organization-verification) in order to start streaming responses and seeing chain of thought summaries from the API. If you're still running into issues, please let us know!

</details>

<details>
<summary>How do I stop Niteo Code CLI from editing my files?</summary>

Niteo Code CLI runs model-generated commands in a sandbox. If a proposed command or file change doesn't look right, you can simply type **n** to deny the command or give the model feedback.

</details>
<details>
<summary>Does it work on Windows?</summary>

Not directly. It requires [Windows Subsystem for Linux (WSL2)](https://learn.microsoft.com/en-us/windows/wsl/install) - Niteo Code CLI has been tested on macOS and Linux with Node 22.

</details>

---

## Zero data retention (ZDR) usage

Niteo Code CLI **does** support OpenAI organizations with [Zero Data Retention (ZDR)](https://platform.openai.com/docs/guides/your-data#zero-data-retention) enabled. If your OpenAI organization has Zero Data Retention enabled and you still encounter errors such as:

```
OpenAI rejected the request. Error details: Status: 400, Code: unsupported_parameter, Type: invalid_request_error, Message: 400 Previous response cannot be used for this organization due to Zero Data Retention.
```

Ensure you are running `niteo-code` with `--config disable_response_storage=true` or add this line to `~/.niteo-code/config.json` to avoid specifying the command line option each time:

```json
{
  "disable_response_storage": true
}
```

See [the configuration documentation](./codex-cli/README.md#configuration-guide) for details.

---

## Niteo Code CLI open source fund

We're excited to support open source projects that use Niteo Code CLI and Azure OpenAI models.

- Support is provided for valid open source projects.
- Applications are reviewed **on a rolling basis**.

**Interested? [Contact us](https://github.com/heberpereiraniteo/codex/issues).**

---

## Contributing

This project is under active development and the code will likely change pretty significantly. We'll update this message once that's complete!

More broadly we welcome contributions - whether you are opening your very first pull request or you're a seasoned maintainer. At the same time we care about reliability and long-term maintainability, so the bar for merging code is intentionally **high**. The guidelines below spell out what "high-quality" means in practice and should make the whole process transparent and friendly.

### Development workflow

- Create a _topic branch_ from `main` - e.g. `feat/interactive-prompt`.
- Keep your changes focused. Multiple unrelated fixes should be opened as separate PRs.
- Following the [development setup](#development-workflow) instructions above, ensure your change is free of lint warnings and test failures.

### Writing high-impact code changes

1. **Start with an issue.** Open a new one or comment on an existing discussion so we can agree on the solution before code is written.
2. **Add or update tests.** Every new feature or bug-fix should come with test coverage that fails before your change and passes afterwards. 100% coverage is not required, but aim for meaningful assertions.
3. **Document behaviour.** If your change affects user-facing behaviour, update the README, inline help (`codex --help`), or relevant example projects.
4. **Keep commits atomic.** Each commit should compile and the tests should pass. This makes reviews and potential rollbacks easier.

### Opening a pull request

- Fill in the PR template (or include similar information) - **What? Why? How?**
- Run **all** checks locally (`cargo test && cargo clippy --tests && cargo fmt -- --config imports_granularity=Item`). CI failures that could have been caught locally slow down the process.
- Make sure your branch is up-to-date with `main` and that you have resolved merge conflicts.
- Mark the PR as **Ready for review** only when you believe it is in a merge-able state.

### Review process

1. One maintainer will be assigned as a primary reviewer.
2. We may ask for changes - please do not take this personally. We value the work, we just also value consistency and long-term maintainability.
3. When there is consensus that the PR meets the bar, a maintainer will squash-and-merge.

### Community values

- **Be kind and inclusive.** Treat others with respect; we follow the [Contributor Covenant](https://www.contributor-covenant.org/).
- **Assume good intent.** Written communication is hard - err on the side of generosity.
- **Teach & learn.** If you spot something confusing, open an issue or PR with improvements.

### Getting help

If you run into problems setting up the project, would like feedback on an idea, or just want to say _hi_ - please open a Discussion or jump into the relevant issue. We are happy to help.

Together we can make Niteo Code CLI an incredible tool. **Happy hacking!** :rocket:

### Contributor license agreement (CLA)

All contributors **must** accept the CLA. The process is lightweight:

1. Open your pull request.
2. Paste the following comment (or reply `recheck` if you've signed before):

   ```text
   I have read the CLA Document and I hereby sign the CLA
   ```

3. The CLA-Assistant bot records your signature in the repo and marks the status check as passed.

No special Git commands, email attachments, or commit footers required.

#### Quick fixes

| Scenario          | Command                                          |
| ----------------- | ------------------------------------------------ |
| Amend last commit | `git commit --amend -s --no-edit && git push -f` |

The **DCO check** blocks merges until every commit in the PR carries the footer (with squash this is just the one).

### Releasing `niteo-code`

_For admins only._

Make sure you are on the main branch and have no local changes. Then run:

```shell
VERSION=0.0.6  # Increment version number
cd codex-cli
npm version $VERSION
npm run build
npm publish
```

This will publish the new version to npm registry.

---

## Security & responsible AI

Have you discovered a vulnerability or have concerns about model output? Please e-mail **security@openai.com** and we will respond promptly.

---

## License

This repository is licensed under the [Apache-2.0 License](LICENSE).

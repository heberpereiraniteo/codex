<h1 align="center">Niteo Code CLI</h1>
<p align="center">Lightweight coding agent that runs in your terminal</p>

<p align="center"><code>npm i -g @niteotech/code</code></p>

---

<details>
<summary><strong>Table of contents</strong></summary>

<!-- Begin ToC -->

- [Experimental technology disclaimer](#experimental-technology-disclaimer)
- [Quickstart](#quickstart)
- [Why Codex?](#why-codex)
- [Security model & permissions](#security-model--permissions)
  - [Platform sandboxing details](#platform-sandboxing-details)
- [System requirements](#system-requirements)
- [CLI reference](#cli-reference)
- [Memory & project docs](#memory--project-docs)
- [Non-interactive / CI mode](#non-interactive--ci-mode)
- [Tracing / verbose logging](#tracing--verbose-logging)
- [Recipes](#recipes)
- [Installation](#installation)
- [Configuration guide](#configuration-guide)
  - [Basic configuration parameters](#basic-configuration-parameters)
  - [Custom AI provider configuration](#custom-ai-provider-configuration)
  - [History configuration](#history-configuration)
  - [Configuration examples](#configuration-examples)
  - [Full configuration example](#full-configuration-example)
  - [Custom instructions](#custom-instructions)
  - [Environment variables setup](#environment-variables-setup)
- [FAQ](#faq)
- [Zero data retention (ZDR) usage](#zero-data-retention-zdr-usage)
- [Codex open source fund](#codex-open-source-fund)
- [Contributing](#contributing)
  - [Development workflow](#development-workflow)
  - [Git hooks with Husky](#git-hooks-with-husky)
  - [Debugging](#debugging)
  - [Writing high-impact code changes](#writing-high-impact-code-changes)
  - [Opening a pull request](#opening-a-pull-request)
  - [Review process](#review-process)
  - [Community values](#community-values)
  - [Getting help](#getting-help)
  - [Contributor license agreement (CLA)](#contributor-license-agreement-cla)
    - [Quick fixes](#quick-fixes)
  - [Releasing `codex`](#releasing-codex)
  - [Alternative build options](#alternative-build-options)
    - [Nix flake development](#nix-flake-development)
- [Security & responsible AI](#security--responsible-ai)
- [License](#license)

<!-- End ToC -->

</details>

---

## Experimental technology disclaimer

Codex CLI is an experimental project under active development. It is not yet stable, may contain bugs, incomplete features, or undergo breaking changes. We're building it in the open with the community and welcome:

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

### Configuração com Azure OpenAI

Este pacote está configurado para funcionar com Azure OpenAI. Você pode configurar de forma interativa ou manual.

#### Configuração Interativa (Recomendado)

Execute o wizard de configuração que irá guiá-lo através de todas as etapas:

```shell
niteo-code --setup-azure
```

O wizard irá:
1. Solicitar sua chave API do Azure OpenAI
2. Pedir a URL base do seu recurso Azure
3. Configurar o nome do modelo/deployment
4. Definir a versão da API
5. Salvar automaticamente em `~/.niteo-code/config.json` e `~/.niteo-code.env`

#### Configuração Manual

Alternativamente, configure manualmente as seguintes variáveis de ambiente:

```shell
export AZURE_OPENAI_API_KEY="sua-chave-api-azure-aqui"
export AZURE_OPENAI_API_VERSION="2025-04-01-preview"
export AZURE_OPENAI_MODEL="codex-mini"
export AZURE_OPENAI_BASE_URL="https://sua-instancia.cognitiveservices.azure.com/openai"
```

> **Nota:** Substitua `sua-chave-api-azure-aqui` pela sua chave API do Azure OpenAI e `sua-instancia` pelo nome da sua instância do Azure Cognitive Services.

Ou crie um arquivo `.env` na raiz do seu projeto:

```env
AZURE_OPENAI_API_KEY=sua-chave-api-azure-aqui
AZURE_OPENAI_API_VERSION=2025-04-01-preview
AZURE_OPENAI_MODEL=codex-mini
AZURE_OPENAI_BASE_URL=https://sua-instancia.cognitiveservices.azure.com/openai
```

O CLI carregará automaticamente as variáveis do arquivo `.env`.

### Configuração adicional (opcional)

Para usar outros provedores além do Azure OpenAI, você pode configurar o provider:

```shell
niteo-code --provider azure "seu prompt aqui"
```

<details>
<summary><strong>Use <code>--provider</code> para usar outros modelos</strong></summary>

> Codex também permite usar outros provedores que suportam a API OpenAI Chat Completions. Você pode definir o provedor no arquivo de configuração ou usar a flag `--provider`. As opções possíveis para `--provider` são:
>
> - azure (padrão para esta versão)
> - openai
> - openrouter
> - gemini
> - ollama
> - mistral
> - deepseek
> - xai
> - groq
> - arceeai
> - qualquer outro provedor compatível com a API OpenAI
>
> Se usar um provedor diferente do Azure, você precisará definir a chave API do provedor no arquivo de configuração ou na variável de ambiente como:
>
> ```shell
> export <provider>_API_KEY="sua-chave-api-aqui"
> ```
>
> Se usar um provedor não listado acima, você também deve definir a URL base do provedor:
>
> ```shell
> export <provider>_BASE_URL="https://url-base-da-api-do-seu-provedor"
> ```

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
niteo-code --approval-mode full-auto "create the fanciest todo-list app"
```

> **💡 Dica para Azure OpenAI:** Se você estiver usando Azure OpenAI, certifique-se de que o modelo especificado em `AZURE_OPENAI_MODEL` está disponível na sua instância do Azure.

That's it - Codex will scaffold a file, run it inside a sandbox, install any
missing dependencies, and show you the live result. Approve the changes and
they'll be committed to your working directory.

---

## Por que Codex?

Codex CLI é construído para desenvolvedores que já **vivem no terminal** e querem
raciocínio no nível do ChatGPT **mais** o poder de realmente executar código, manipular
arquivos e iterar - tudo sob controle de versão. Em resumo, é _desenvolvimento orientado por chat_
que entende e executa seu repositório.

- **Zero configuração** - traga sua chave API do Azure OpenAI e funciona!
- **Aprovação automática completa, mantendo segurança** executando com rede desabilitada e em sandbox de diretório
- **Multimodal** - passe screenshots ou diagramas para implementar recursos ✨

E é **totalmente open-source** para que você possa ver e contribuir para como ele se desenvolve!

---

## Security model & permissions

Codex lets you decide _how much autonomy_ the agent receives and auto-approval policy via the
`--approval-mode` flag (or the interactive onboarding prompt):

| Mode                      | What the agent may do without asking                                                                | Still requires approval                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Suggest** <br>(default) | <li>Read any file in the repo                                                                       | <li>**All** file writes/patches<li> **Any** arbitrary shell commands (aside from reading files) |
| **Auto Edit**             | <li>Read **and** apply-patch writes to files                                                        | <li>**All** shell commands                                                                      |
| **Full Auto**             | <li>Read/write files <li> Execute shell commands (network disabled, writes limited to your workdir) | -                                                                                               |

In **Full Auto** every command is run **network-disabled** and confined to the
current working directory (plus temporary files) for defense-in-depth. Codex
will also show a warning/confirmation if you start in **auto-edit** or
**full-auto** while the directory is _not_ tracked by Git, so you always have a
safety net.

Coming soon: you'll be able to whitelist specific commands to auto-execute with
the network enabled, once we're confident in additional safeguards.

### Platform sandboxing details

The hardening mechanism Codex uses depends on your OS:

- **macOS 12+** - commands are wrapped with **Apple Seatbelt** (`sandbox-exec`).

  - Everything is placed in a read-only jail except for a small set of
    writable roots (`$PWD`, `$TMPDIR`, `~/.codex`, etc.).
  - Outbound network is _fully blocked_ by default - even if a child process
    tries to `curl` somewhere it will fail.

- **Linux** - there is no sandboxing by default.
  We recommend using Docker for sandboxing, where Codex launches itself inside a **minimal
  container image** and mounts your repo _read/write_ at the same path. A
  custom `iptables`/`ipset` firewall script denies all egress except the
  OpenAI API. This gives you deterministic, reproducible runs without needing
  root on the host. You can use the [`run_in_container.sh`](../codex-cli/scripts/run_in_container.sh) script to set up the sandbox.

---

## System requirements

| Requirement                 | Details                                                         |
| --------------------------- | --------------------------------------------------------------- |
| Operating systems           | macOS 12+, Ubuntu 20.04+/Debian 10+, or Windows 11 **via WSL2** |
| Node.js                     | **22 or newer** (LTS recommended)                               |
| Git (optional, recommended) | 2.23+ for built-in PR helpers                                   |
| RAM                         | 4-GB minimum (8-GB recommended)                                 |

> Never run `sudo npm install -g`; fix npm permissions instead.

---

## CLI reference

| Command                              | Purpose                             | Example                              |
| ------------------------------------ | ----------------------------------- | ------------------------------------ |
| `niteo-code`                         | Interactive REPL                    | `niteo-code`                         |
| `niteo-code "..."`                   | Initial prompt for interactive REPL | `niteo-code "fix lint errors"`      |
| `niteo-code -q "..."`                | Non-interactive "quiet mode"        | `niteo-code -q --json "explain utils.ts"` |
| `niteo-code --setup-azure`           | Interactive Azure OpenAI setup      | `niteo-code --setup-azure`          |
| `niteo-code completion <bash\|zsh\|fish>` | Print shell completion script       | `niteo-code completion bash`         |

Key flags: `--model/-m`, `--provider/-p`, `--approval-mode/-a`, `--quiet/-q`, `--setup-azure`, and `--notify`.

---

## Memory & project docs

You can give Codex extra instructions and guidance using `AGENTS.md` files. Codex looks for `AGENTS.md` files in the following places, and merges them top-down:

1. `~/.niteo-code/AGENTS.md` - personal global guidance
2. `AGENTS.md` at repo root - shared project notes
3. `AGENTS.md` in the current working directory - sub-folder/feature specifics

Disable loading of these files with `--no-project-doc` or the environment variable `CODEX_DISABLE_PROJECT_DOC=1`.

---

## Non-interactive / CI mode

Run Codex head-less in pipelines. Example GitHub Action step:

```yaml
- name: Update changelog via Codex
  run: |
    npm install -g @niteotech/code
    export AZURE_OPENAI_API_KEY="${{ secrets.AZURE_OPENAI_API_KEY }}"
    export AZURE_OPENAI_API_VERSION="2025-04-01-preview"
    export AZURE_OPENAI_MODEL="codex-mini"
    export AZURE_OPENAI_BASE_URL="${{ secrets.AZURE_OPENAI_BASE_URL }}"
    niteo-code -a auto-edit --quiet "update CHANGELOG for next release"
```

Set `CODEX_QUIET_MODE=1` to silence interactive UI noise.

## Tracing / verbose logging

Setting the environment variable `DEBUG=true` prints full API request and response details:

```shell
DEBUG=true niteo-code
```

---

## Recipes

Below are a few bite-size examples you can copy-paste. Replace the text in quotes with your own task. See the [prompting guide](https://github.com/openai/codex/blob/main/codex-cli/examples/prompting_guide.md) for more tips and usage patterns.

| ✨  | What you type                                                                   | What happens                                                               |
| --- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | `niteo-code "Refactor the Dashboard component to React Hooks"`                 | Codex rewrites the class component, runs `npm test`, and shows the diff.   |
| 2   | `niteo-code "Generate SQL migrations for adding a users table"`                | Infers your ORM, creates migration files, and runs them in a sandboxed DB. |
| 3   | `niteo-code "Write unit tests for utils/date.ts"`                              | Generates tests, executes them, and iterates until they pass.              |
| 4   | `niteo-code "Bulk-rename *.jpeg -> *.jpg with git mv"`                         | Safely renames files and updates imports/usages.                           |
| 5   | `niteo-code "Explain what this regex does: ^(?=.*[A-Z]).{8,}$"`                | Outputs a step-by-step human explanation.                                  |
| 6   | `niteo-code "Carefully review this repo, and propose 3 high impact well-scoped PRs"` | Suggests impactful PRs in the current codebase.                            |
| 7   | `niteo-code "Look for vulnerabilities and create a security review report"`    | Finds and explains security bugs.                                          |

---

## Installation

<details open>
<summary><strong>Do npm (Recomendado)</strong></summary>

```bash
npm install -g @niteotech/code
# ou
yarn global add @niteotech/code
# ou
bun install -g @niteotech/code
# ou
pnpm add -g @niteotech/code
```

</details>

<details>
<summary><strong>Build from source</strong></summary>

```bash
# Clone the repository and navigate to the CLI package
git clone https://github.com/openai/codex.git
cd codex/codex-cli

# Enable corepack
corepack enable

# Install dependencies and build
pnpm install
pnpm build

# Linux-only: download prebuilt sandboxing binaries (requires gh and zstd).
./scripts/install_native_deps.sh

# Get the usage and the options
node ./dist/cli.js --help

# Run the locally-built CLI directly
node ./dist/cli.js

# Or link the command globally for convenience
pnpm link
```

</details>

---

## Configuration guide

Codex configuration files can be placed in the `~/.niteo-code/` directory, supporting both YAML and JSON formats.

### Basic configuration parameters

| Parameter           | Type    | Default    | Description                      | Available Options                                                                              |
| ------------------- | ------- | ---------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `model`             | string  | `codex-mini`  | AI model to use                  | Any model name supporting OpenAI API                                                           |
| `provider`          | string  | `azure`    | AI provider to use               | `azure`, `openai`, `openrouter`, `gemini`, etc.                                                |
| `approvalMode`      | string  | `suggest`  | AI assistant's permission mode   | `suggest` (suggestions only)<br>`auto-edit` (automatic edits)<br>`full-auto` (fully automatic) |
| `fullAutoErrorMode` | string  | `ask-user` | Error handling in full-auto mode | `ask-user` (prompt for user input)<br>`ignore-and-continue` (ignore and proceed)               |
| `notify`            | boolean | `true`     | Enable desktop notifications     | `true`/`false`                                                                                 |

### Custom AI provider configuration

In the `providers` object, you can configure multiple AI service providers. Each provider requires the following parameters:

| Parameter | Type   | Description                             | Example                       |
| --------- | ------ | --------------------------------------- | ----------------------------- |
| `name`    | string | Display name of the provider            | `"OpenAI"`                    |
| `baseURL` | string | API service URL                         | `"https://api.openai.com/v1"` |
| `envKey`  | string | Environment variable name (for API key) | `"OPENAI_API_KEY"`            |

### History configuration

In the `history` object, you can configure conversation history settings:

| Parameter           | Type    | Description                                            | Example Value |
| ------------------- | ------- | ------------------------------------------------------ | ------------- |
| `maxSize`           | number  | Maximum number of history entries to save              | `1000`        |
| `saveHistory`       | boolean | Whether to save history                                | `true`        |
| `sensitivePatterns` | array   | Patterns of sensitive information to filter in history | `[]`          |

### Configuration examples

1. YAML format (save as `~/.niteo-code/config.yaml`):

```yaml
model: codex-mini
provider: azure
approvalMode: suggest
fullAutoErrorMode: ask-user
notify: true
```

2. JSON format (save as `~/.niteo-code/config.json`):

```json
{
  "model": "codex-mini",
  "provider": "azure",
  "approvalMode": "suggest",
  "fullAutoErrorMode": "ask-user",
  "notify": true
}
```

### Full configuration example

Below is a comprehensive example of `config.json` with multiple custom providers:

```json
{
  "model": "codex-mini",
  "provider": "azure",
  "providers": {
    "azure": {
      "name": "AzureOpenAI",
      "baseURL": "https://SUA_INSTANCIA.cognitiveservices.azure.com/openai",
      "envKey": "AZURE_OPENAI_API_KEY"
    },
    "openai": {
      "name": "OpenAI",
      "baseURL": "https://api.openai.com/v1",
      "envKey": "OPENAI_API_KEY"
    },
    "openrouter": {
      "name": "OpenRouter",
      "baseURL": "https://openrouter.ai/api/v1",
      "envKey": "OPENROUTER_API_KEY"
    },
    "gemini": {
      "name": "Gemini",
      "baseURL": "https://generativelanguage.googleapis.com/v1beta/openai",
      "envKey": "GEMINI_API_KEY"
    },
    "ollama": {
      "name": "Ollama",
      "baseURL": "http://localhost:11434/v1",
      "envKey": "OLLAMA_API_KEY"
    },
    "mistral": {
      "name": "Mistral",
      "baseURL": "https://api.mistral.ai/v1",
      "envKey": "MISTRAL_API_KEY"
    },
    "deepseek": {
      "name": "DeepSeek",
      "baseURL": "https://api.deepseek.com",
      "envKey": "DEEPSEEK_API_KEY"
    },
    "xai": {
      "name": "xAI",
      "baseURL": "https://api.x.ai/v1",
      "envKey": "XAI_API_KEY"
    },
    "groq": {
      "name": "Groq",
      "baseURL": "https://api.groq.com/openai/v1",
      "envKey": "GROQ_API_KEY"
    },
    "arceeai": {
      "name": "ArceeAI",
      "baseURL": "https://conductor.arcee.ai/v1",
      "envKey": "ARCEEAI_API_KEY"
    }
  },
  "history": {
    "maxSize": 1000,
    "saveHistory": true,
    "sensitivePatterns": []
  }
}
```

### Custom instructions

You can create a `~/.niteo-code/AGENTS.md` file to define custom guidance for the agent:

```markdown
- Always respond with emojis
- Only use git commands when explicitly requested
```

### Environment variables setup

Para cada provedor de IA, você precisa definir a chave API correspondente nas suas variáveis de ambiente. Por exemplo:

```bash
# Azure OpenAI (padrão)
export AZURE_OPENAI_API_KEY="sua-chave-azure-api-aqui"
export AZURE_OPENAI_API_VERSION="2025-04-01-preview"
export AZURE_OPENAI_MODEL="codex-mini"
export AZURE_OPENAI_BASE_URL="https://sua-instancia.cognitiveservices.azure.com/openai"

# OpenAI
export OPENAI_API_KEY="sua-chave-api-aqui"

# OpenRouter
export OPENROUTER_API_KEY="sua-chave-openrouter-aqui"

# Similarmente para outros provedores
```

---

## FAQ

<details>
<summary>Como configurar para usar Azure OpenAI?</summary>

Esta versão está pré-configurada para usar Azure OpenAI. A forma mais fácil é usar o wizard interativo:

```bash
niteo-code --setup-azure
```

O wizard irá guiá-lo através de todas as etapas necessárias e salvar a configuração automaticamente.

Alternativamente, configure manualmente as seguintes variáveis de ambiente:

```bash
export AZURE_OPENAI_API_KEY="sua-chave-api-azure"
export AZURE_OPENAI_API_VERSION="2025-04-01-preview"
export AZURE_OPENAI_MODEL="codex-mini"
export AZURE_OPENAI_BASE_URL="https://sua-instancia.cognitiveservices.azure.com/openai"
```

Certifique-se de que o modelo especificado está disponível na sua instância do Azure.

</details>

<details>
<summary>O que fazer se aparecer "Azure OpenAI not configured"?</summary>

Esta mensagem aparece quando o CLI não encontra as configurações do Azure OpenAI. Execute o wizard de configuração:

```bash
niteo-code --setup-azure
```

O wizard irá configurar tudo automaticamente para você. Se preferir configurar manualmente, defina as variáveis de ambiente necessárias conforme mostrado na documentação.

</details>

<details>
<summary>OpenAI released a model called Codex in 2021 - is this related?</summary>

In 2021, OpenAI released Codex, an AI system designed to generate code from natural language prompts. That original Codex model was deprecated as of March 2023 and is separate from the CLI tool.

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
<summary>How do I stop Codex from editing my files?</summary>

Codex runs model-generated commands in a sandbox. If a proposed command or file change doesn't look right, you can simply type **n** to deny the command or give the model feedback.

</details>
<details>
<summary>Does it work on Windows?</summary>

Not directly. It requires [Windows Subsystem for Linux (WSL2)](https://learn.microsoft.com/en-us/windows/wsl/install) - Codex has been tested on macOS and Linux with Node 22.

</details>

---

## Zero data retention (ZDR) usage

Codex CLI **does** support OpenAI organizations with [Zero Data Retention (ZDR)](https://platform.openai.com/docs/guides/your-data#zero-data-retention) enabled. If your OpenAI organization has Zero Data Retention enabled and you still encounter errors such as:

```
OpenAI rejected the request. Error details: Status: 400, Code: unsupported_parameter, Type: invalid_request_error, Message: 400 Previous response cannot be used for this organization due to Zero Data Retention.
```

You may need to upgrade to a more recent version with: `npm i -g @openai/codex@latest`

---

## Codex open source fund

We're excited to launch a **$1 million initiative** supporting open source projects that use Codex CLI and other OpenAI models.

- Grants are awarded up to **$25,000** API credits.
- Applications are reviewed **on a rolling basis**.

**Interested? [Apply here](https://openai.com/form/codex-open-source-fund/).**

---

## Contributing

This project is under active development and the code will likely change pretty significantly. We'll update this message once that's complete!

More broadly we welcome contributions - whether you are opening your very first pull request or you're a seasoned maintainer. At the same time we care about reliability and long-term maintainability, so the bar for merging code is intentionally **high**. The guidelines below spell out what "high-quality" means in practice and should make the whole process transparent and friendly.

### Development workflow

- Create a _topic branch_ from `main` - e.g. `feat/interactive-prompt`.
- Keep your changes focused. Multiple unrelated fixes should be opened as separate PRs.
- Use `pnpm test:watch` during development for super-fast feedback.
- We use **Vitest** for unit tests, **ESLint** + **Prettier** for style, and **TypeScript** for type-checking.
- Before pushing, run the full test/type/lint suite:

### Git hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality checks:

- **Pre-commit hook**: Automatically runs lint-staged to format and lint files before committing
- **Pre-push hook**: Runs tests and type checking before pushing to the remote

These hooks help maintain code quality and prevent pushing code with failing tests. For more details, see [HUSKY.md](./HUSKY.md).

```bash
pnpm test && pnpm run lint && pnpm run typecheck
```

- If you have **not** yet signed the Contributor License Agreement (CLA), add a PR comment containing the exact text

  ```text
  I have read the CLA Document and I hereby sign the CLA
  ```

  The CLA-Assistant bot will turn the PR status green once all authors have signed.

```bash
# Watch mode (tests rerun on change)
pnpm test:watch

# Type-check without emitting files
pnpm typecheck

# Automatically fix lint + prettier issues
pnpm lint:fix
pnpm format:fix
```

### Debugging

To debug the CLI with a visual debugger, do the following in the `codex-cli` folder:

- Run `pnpm run build` to build the CLI, which will generate `cli.js.map` alongside `cli.js` in the `dist` folder.
- Run the CLI with `node --inspect-brk ./dist/cli.js` The program then waits until a debugger is attached before proceeding. Options:
  - In VS Code, choose **Debug: Attach to Node Process** from the command palette and choose the option in the dropdown with debug port `9229` (likely the first option)
  - Go to <chrome://inspect> in Chrome and find **localhost:9229** and click **trace**

### Writing high-impact code changes

1. **Start with an issue.** Open a new one or comment on an existing discussion so we can agree on the solution before code is written.
2. **Add or update tests.** Every new feature or bug-fix should come with test coverage that fails before your change and passes afterwards. 100% coverage is not required, but aim for meaningful assertions.
3. **Document behaviour.** If your change affects user-facing behaviour, update the README, inline help (`niteo-code --help`), or relevant example projects.
4. **Keep commits atomic.** Each commit should compile and the tests should pass. This makes reviews and potential rollbacks easier.

### Opening a pull request

- Fill in the PR template (or include similar information) - **What? Why? How?**
- Run **all** checks locally (`npm test && npm run lint && npm run typecheck`). CI failures that could have been caught locally slow down the process.
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

Together we can make Codex CLI an incredible tool. **Happy hacking!** :rocket:

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

### Releasing `codex`

To publish a new version of the CLI you first need to stage the npm package. A
helper script in `codex-cli/scripts/` does all the heavy lifting. Inside the
`codex-cli` folder run:

```bash
# Classic, JS implementation that includes small, native binaries for Linux sandboxing.
pnpm stage-release

# Optionally specify the temp directory to reuse between runs.
RELEASE_DIR=$(mktemp -d)
pnpm stage-release --tmp "$RELEASE_DIR"

# "Fat" package that additionally bundles the native Rust CLI binaries for
# Linux. End-users can then opt-in at runtime by setting CODEX_RUST=1.
pnpm stage-release --native
```

Go to the folder where the release is staged and verify that it works as intended. If so, run the following from the temp folder:

```
cd "$RELEASE_DIR"
npm publish
```

### Alternative build options

#### Nix flake development

Prerequisite: Nix >= 2.4 with flakes enabled (`experimental-features = nix-command flakes` in `~/.config/nix/nix.conf`).

Enter a Nix development shell:

```bash
# Use either one of the commands according to which implementation you want to work with
nix develop .#codex-cli # For entering codex-cli specific shell
nix develop .#codex-rs # For entering codex-rs specific shell
```

This shell includes Node.js, installs dependencies, builds the CLI, and provides a `niteo-code` command alias.

Build and run the CLI directly:

```bash
# Use either one of the commands according to which implementation you want to work with
nix build .#codex-cli # For building codex-cli
nix build .#codex-rs # For building codex-rs
./result/bin/niteo-code --help
```

Run the CLI via the flake app:

```bash
# Use either one of the commands according to which implementation you want to work with
nix run .#codex-cli # For running codex-cli
nix run .#codex-rs # For running codex-rs
```

Use direnv with flakes

If you have direnv installed, you can use the following `.envrc` to automatically enter the Nix shell when you `cd` into the project directory:

```bash
cd codex-rs
echo "use flake ../flake.nix#codex-cli" >> .envrc && direnv allow
cd codex-cli
echo "use flake ../flake.nix#codex-rs" >> .envrc && direnv allow
```

---

## Security & responsible AI

Have you discovered a vulnerability or have concerns about model output? Please e-mail **security@openai.com** and we will respond promptly.

---

## License

This repository is licensed under the [Apache-2.0 License](LICENSE).

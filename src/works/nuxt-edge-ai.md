---
title: Nuxt Edge AI
description: A community Nuxt module for local-first AI apps with local WASM inference and OpenAI-compatible remote fallback.
---

`nuxt-edge-ai` is a community Nuxt module for building local-first AI applications with a real server-side WASM inference runtime and an optional OpenAI-compatible remote fallback.

It gives a Nuxt app one stable AI surface across three execution modes: `local`, `remote`, and `mock`.

## Why it exists

Most AI integrations either assume a hosted API from day one or ask the consumer app to manage extra native runtimes. `nuxt-edge-ai` keeps the integration Nuxt-native:

- install as a regular Nuxt module
- expose Nitro routes for health, model pull, and generation
- provide a client composable for app-side calls
- preserve an OpenAI-like `chat.completions.create()` experience
- bundle the `transformers.js` and ONNX Runtime WASM path inside the package

For consumers, that means no Ollama, no `llama.cpp`, no Rust, no C++, and no Python requirement just to get started.

## Runtime modes

- `local`: run model inference inside the Nuxt/Nitro server through the bundled WASM runtime
- `remote`: forward requests to an OpenAI-compatible provider such as OpenAI or OpenRouter
- `mock`: use deterministic responses for tests, CI, and module validation

This makes it practical to start locally, fall back to a stronger hosted model when needed, and keep the application-side integration unchanged.

## OpenAI-style API surface

One of the core goals of the project is to avoid a custom DX tax. You can use the module client with an OpenAI-like calling style, or point the official OpenAI SDK at the module route.

```ts
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'http://localhost:3000/api/edge-ai',
  apiKey: 'local-dev-token',
})

const response = await client.chat.completions.create({
  model: 'openai/gpt-oss-20b:free',
  messages: [
    {
      role: 'user',
      content: 'Summarize this module in one sentence.',
    },
  ],
})
```

Inside a Nuxt app, the built-in composable exposes the same shape through `useEdgeAI().client.chat.completions.create(...)`.

## What it ships

- Nuxt module install surface
- Nitro endpoints for `health`, `pull`, `generate`, and `chat/completions`
- a `useEdgeAI()` composable for app-side usage
- an `EdgeAI` SDK for OpenAI-style calls
- packaged runtime assets for the local inference path
- support for local presets plus optional remote fallback

## Current scope

- Supported: Nuxt 4, Node/Nitro runtime, local inference, remote inference, mock mode
- Not yet supported: streaming responses, edge worker runtimes, broader local tasks beyond text generation

The package is intentionally scoped as a practical community module: one consistent AI entry point for Nuxt apps, with a local-first default and a remote escape hatch when model quality or latency requirements change.

## Links

- GitHub: [otadk/nuxt-edge-ai](https://github.com/otadk/nuxt-edge-ai)
- npm: [nuxt-edge-ai](https://www.npmjs.com/package/nuxt-edge-ai)
- Docs: [Project README](https://github.com/otadk/nuxt-edge-ai#readme)

<p align="center">
  <img src="https://counterapi.dev/img/logo.png" alt="CounterAPI" width="200">
</p>

<h1 align="center">CounterAPI JavaScript Client</h1>

<p align="center">
  A tiny, typed JavaScript/TypeScript client for <a href="https://counterapi.dev">CounterAPI</a> — a hosted counter behind a URL, for page views, feature usage, or anything else you want to count.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/counterapi"><img src="https://img.shields.io/npm/v/counterapi.svg" alt="npm version"></a>
  <a href="https://github.com/counterapi/counter.js/actions/workflows/main.yml"><img src="https://github.com/counterapi/counter.js/actions/workflows/main.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/counterapi"><img src="https://img.shields.io/npm/dm/counterapi.svg" alt="npm downloads"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/counterapi.svg" alt="license"></a>
  <a href="https://www.npmjs.com/package/counterapi"><img src="https://img.shields.io/badge/types-included-blue.svg" alt="TypeScript types included"></a>
</p>

## Quick start

```bash
npm install counterapi
```

```js
import { Counter } from 'counterapi';

const counter = new Counter({ workspace: 'my-workspace' });

const { data } = await counter.up('page-views');
console.log(`${data.up_count} views so far`);
```

New here? [Sign up for free](https://app.counterapi.dev/register) (no credit card required) and create a workspace — that's the `workspace` value above. Full guides and API reference live at [docs.counterapi.dev](https://docs.counterapi.dev).

> **Upgrading from v2.x?** v3 drops the retired CounterAPI v1 API. The `version` and `namespace` config options are gone — use `workspace` instead — and the response types now match what the API actually returns (`{ code, data: {...} }`). See [Response Shapes](#response-shapes) below.

## Why this library

- **Works everywhere** — Node.js, browser (via CDN or bundler), ESM and CommonJS
- **Typed** — full TypeScript definitions, no `@types` package needed
- **Small** — one dependency (axios), nothing else
- **Simple errors** — every failure comes back as a plain `{ message, status, code }` object

## Installation

```bash
npm install counterapi
# or
yarn add counterapi
```

Or drop it straight into a page:

```html
<script src="https://cdn.jsdelivr.net/npm/counterapi/dist/counter.browser.min.js"></script>
<script>
  const counter = new Counter({ workspace: 'my-workspace' });
</script>
```

## Usage

### Import

```js
// ESM (recommended)
import { Counter } from 'counterapi';

// CommonJS
const { Counter } = require('counterapi');
```

### Create a client

```js
const counter = new Counter({
  workspace: 'my-workspace',
  accessToken: 'your-token', // optional — needed for private/authenticated counters
  timeout: 5000,              // optional — request timeout in ms (default: 10000)
  debug: false                 // optional — log requests/responses to the console
});
```

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `workspace` | `string` | Yes | Your workspace name |
| `accessToken` | `string` | No | Auth token for private/authenticated counters |
| `timeout` | `number` | No | Request timeout in ms (default `10000`) |
| `debug` | `boolean` | No | Log requests/responses to the console (default `false`) |

### Methods

| Method | Description |
| --- | --- |
| `get(name)` | Get the current value of a counter |
| `up(name)` | Increment a counter by 1 |
| `down(name)` | Decrement a counter by 1 |
| `reset(name)` | Reset a counter to 0 |
| `stats(name)` | Get usage statistics for a counter |

```js
const counter = await counterClient.get('page-views');
console.log(`Up: ${counter.data.up_count}, Down: ${counter.data.down_count}`);

await counterClient.up('page-views');
await counterClient.down('page-views');
await counterClient.reset('page-views');

const stats = await counterClient.stats('page-views');
console.log(`Today's up count: ${stats.data.stats.today.up}`);
```

### Error handling

Every call is a Promise — failures reject with a plain object:

```js
try {
  await counterClient.up('page-views');
} catch (error) {
  console.error(error.message, error.status, error.code);
}
```

### Response shapes

<details>
<summary><code>get</code> / <code>up</code> / <code>down</code> / <code>reset</code></summary>

```json
{
  "code": "200",
  "data": {
    "id": 1,
    "name": "test",
    "slug": "test",
    "description": "",
    "up_count": 4,
    "down_count": 4,
    "team_id": 4,
    "user_id": 7,
    "workspace_id": 1,
    "workspace_slug": "test",
    "created_at": "2025-06-17T11:33:23Z",
    "updated_at": "2025-06-17T11:33:23Z"
  }
}
```

`reset` omits `up_count`/`down_count` from `data`.

</details>

<details>
<summary><code>stats</code></summary>

```json
{
  "code": "200",
  "message": "Counter stats retrieved successfully",
  "data": {
    "id": 1,
    "counter_id": 1,
    "up_count": 6,
    "down_count": 4,
    "stats": {
      "today": { "up": 6, "down": 4 },
      "this_week": { "up": 6, "down": 4 },
      "temporal": {
        "hours": { "07": { "up": 6, "down": 4 } },
        "weekdays": { "wednesday": { "up": 6, "down": 4 } },
        "quarters": { "q2": { "up": 6, "down": 4 } }
      }
    },
    "created_at": "2025-06-17T11:33:23Z",
    "updated_at": "2025-06-18T07:44:11Z"
  }
}
```

`temporal.hours` covers every hour (`00`–`23`), `weekdays` covers every day, and `quarters` covers `q1`–`q4` — trimmed above for brevity.

</details>

## Examples

Ready-to-run apps in [`./examples`](./examples):

- **[Browser](./examples/browser)** — interactive UI for get/up/down/reset/stats, backed by a local build or the CDN
- **[Node.js](./examples/node)** — minimal server-side counter fetch with ESM

```bash
npm run build        # build the library first
cd examples/node && node index.js
```

## Documentation & Support

- Docs: [docs.counterapi.dev](https://docs.counterapi.dev)
- Sign up: [app.counterapi.dev/register](https://app.counterapi.dev/register)
- Issues & feature requests: [GitHub Issues](https://github.com/counterapi/counter.js/issues)

## License

MIT

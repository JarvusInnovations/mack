# Mack: Markdown to Slack Message Blocks

> Convert Markdown and GitHub Flavoured Markdown to Slack BlockKit Blocks

## About this fork

`@jarvus/mack` is a fork of [tryfabric/mack](https://github.com/tryfabric/mack) maintained by [Jarvus Innovations](https://github.com/JarvusInnovations). It was forked at upstream commit [`5dc0226`](https://github.com/tryfabric/mack/commit/5dc0226); upstream has been unmaintained since 2023 (last release `@tryfabric/mack@1.2.1`, June 2022).

```
npm install @jarvus/mack
```

What the fork adds over upstream 1.2.1:

- Markdown tables render as native Slack `table` blocks, with column alignment preserved ([`437cce3`](https://github.com/JarvusInnovations/mack/commit/437cce3))
- Markdown lists render as native Slack `rich_text` blocks ([`49c6620`](https://github.com/JarvusInnovations/mack/commit/49c6620))
- HTML entities are decoded correctly, including inside code blocks ([`dfd7b1a`](https://github.com/JarvusInnovations/mack/commit/dfd7b1a), [`9439113`](https://github.com/JarvusInnovations/mack/commit/9439113), [`c8205e7`](https://github.com/JarvusInnovations/mack/commit/c8205e7), [`d0a9d6c`](https://github.com/JarvusInnovations/mack/commit/d0a9d6c))
- Committed build output so the package can be installed straight from git ([`ccc4991`](https://github.com/JarvusInnovations/mack/commit/ccc4991))

See [CHANGELOG.md](CHANGELOG.md) for release history.

[![Node.js CI](https://github.com/JarvusInnovations/mack/actions/workflows/ci.yml/badge.svg)](https://github.com/JarvusInnovations/mack/actions/workflows/ci.yml)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

Mack is a Markdown parser to convert any Markdown content to Slack BlockKit block objects.

Text is truncated to fit within the Slack API's limits.

### Supported Markdown Elements

- All inline elements (italics, bold, strikethrough, inline code, hyperlinks)
- Lists (ordered, unordered, nested), as native `rich_text` blocks. Task-list checkboxes render as plain bullets; the checked state is not shown
- All headers
- Code blocks
- Block quotes (with some limitations)
- Images
- Thematic Breaks / Dividers
- Tables, as native Slack `table` blocks (column alignment preserved; Slack allows one table per message)

### Not Yet Supported Markdown Elements

- Block quotes (limited functionality; does not support lists, headings, or images within the block quote)

## Installation

```
npm install @jarvus/mack
```

## Usage

```ts
import {markdownToBlocks} from '@jarvus/mack';

const blocks = await markdownToBlocks(`
# Hello world

* bulleted item 1
* bulleted item 2

abc _123_

![cat](https://images.unsplash.com/photo-1574158622682-e40e69881006)
`);
```

The `blocks` object now results in [this](https://app.slack.com/block-kit-builder/T01BFUV9UPJ#%7B%22blocks%22:%5B%7B%22text%22:%7B%22text%22:%22Hello%20world%22,%22type%22:%22plain_text%22%7D,%22type%22:%22header%22%7D,%7B%22text%22:%7B%22text%22:%22•%20bulleted%20item%201%5Cn•%20bulleted%20item%202%22,%22type%22:%22mrkdwn%22%7D,%22type%22:%22section%22%7D,%7B%22text%22:%7B%22text%22:%22abc%20_123_%22,%22type%22:%22mrkdwn%22%7D,%22type%22:%22section%22%7D,%7B%22alt_text%22:%22cat%22,%22image_url%22:%22https://images.unsplash.com/photo-1574158622682-e40e69881006?w=640%22,%22type%22:%22image%22%7D%5D%7D) payload.

## API

`async function markdownToBlocks(text: string, options?: ParsingOptions): Promise<KnownBlock[]>`

- `text`: the content to parse
- `options`: the options to use when parsing.

### Parsing Options

```ts
interface ParsingOptions {
  // Configure how lists are displayed
  lists?: ListOptions;
}

interface ListOptions {
  // Configure how checkbox list items are displayed. By default, they are prefixed with '* '
  checkboxPrefix?: (checked: boolean) => string;
}
```

> **Note:** since lists became native `rich_text` blocks in 1.3.0, `lists.checkboxPrefix` is accepted but ignored.

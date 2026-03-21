import type { KnownBlock } from '@slack/types';
import type { ParsingOptions } from './types';
/**
 * Parses Markdown content into Slack BlockKit Blocks.
 * - Supports headings (all Markdown heading levels are treated as the single Slack header block)
 * - Supports numbered lists, bulleted lists, to-do lists
 * - Supports italics, bold, strikethrough, inline code, hyperlinks
 * - Supports images
 * - Supports thematic breaks / dividers
 *
 * Per Slack limitations, these markdown attributes are not completely supported:
 * - Tables: rendered as native Slack table blocks (alignment preserved, one table per message)
 * - Block quotes (limited functionality; does not support lists, headings, or images within the block quote)
 *
 * Supports GitHub-flavoured Markdown.
 *
 * @param body any Markdown or GFM content
 * @param options options to configure the parser
 */
export declare function markdownToBlocks(body: string, options?: ParsingOptions): Promise<KnownBlock[]>;

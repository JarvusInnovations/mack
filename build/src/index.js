"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownToBlocks = void 0;
const he_1 = require("he");
const internal_1 = require("./parser/internal");
const marked_1 = require("marked");
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
async function markdownToBlocks(body, options = {}) {
    // Slack only wants &, <, and > escaped
    // https://api.slack.com/reference/surfaces/formatting#escaping
    const replacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
    };
    const lexer = new marked_1.marked.Lexer();
    const tokenizer = lexer
        .tokenizer;
    const inlineTextRule = tokenizer.rules.inline.text;
    const decodeAndEscape = (src) => {
        const decoded = he_1.decode(src, { isAttributeValue: false, strict: false });
        return decoded.replace(/[&<>]/g, char => replacements[char]);
    };
    tokenizer.inlineText = (src) => {
        const cap = inlineTextRule.exec(src);
        if (!cap)
            return false;
        return {
            type: 'text',
            raw: cap[0],
            text: decodeAndEscape(cap[0]),
        };
    };
    const codespanRule = /^(?:\*{1,2})?(`+)([^`]|[^`][\s\S]*?[^`])\1(?!\*)(?:\*{1,2})?/;
    tokenizer.codespan = (src) => {
        const cap = codespanRule.exec(src);
        if (!cap)
            return false;
        let text = cap[2].replace(/\n/g, ' ');
        const hasNonSpaceChars = /[^ ]/.test(text);
        const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
        if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
            text = text.substring(1, text.length - 1);
        }
        return {
            type: 'codespan',
            raw: cap[0],
            text: decodeAndEscape(text),
        };
    };
    const tokens = lexer.lex(body);
    return internal_1.parseBlocks(tokens, options);
}
exports.markdownToBlocks = markdownToBlocks;
//# sourceMappingURL=index.js.map
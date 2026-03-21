"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBlocks = void 0;
const slack_1 = require("../slack");
const fast_xml_parser_1 = require("fast-xml-parser");
function parsePlainText(element) {
    var _a;
    switch (element.type) {
        case 'link':
        case 'em':
        case 'strong':
        case 'del':
            return element.tokens.flatMap(child => parsePlainText(child));
        case 'br':
            return [];
        case 'image':
            return [(_a = element.title) !== null && _a !== void 0 ? _a : element.href];
        case 'codespan':
        case 'text':
        case 'html':
            return [element.raw];
    }
}
function isSectionBlock(block) {
    return block.type === 'section';
}
function parseMrkdwn(element) {
    switch (element.type) {
        case 'link': {
            return `<${element.href}|${element.tokens
                .flatMap(child => parseMrkdwn(child))
                .join('')}> `;
        }
        case 'em': {
            return `_${element.tokens
                .flatMap(child => parseMrkdwn(child))
                .join('')}_`;
        }
        case 'codespan':
            return `\`${element.text}\``;
        case 'strong': {
            return `*${element.tokens
                .flatMap(child => parseMrkdwn(child))
                .join('')}*`;
        }
        case 'text':
            return element.text;
        case 'del': {
            return `~${element.tokens
                .flatMap(child => parseMrkdwn(child))
                .join('')}~`;
        }
        default:
            return '';
    }
}
function addMrkdwn(content, accumulator) {
    const last = accumulator[accumulator.length - 1];
    if (last && isSectionBlock(last) && last.text) {
        last.text.text += content;
    }
    else {
        accumulator.push(slack_1.section(content));
    }
}
function parsePhrasingContentToStrings(element, accumulator) {
    var _a, _b, _c;
    if (element.type === 'image') {
        accumulator.push((_c = (_b = (_a = element.href) !== null && _a !== void 0 ? _a : element.title) !== null && _b !== void 0 ? _b : element.text) !== null && _c !== void 0 ? _c : 'image');
    }
    else {
        const text = parseMrkdwn(element);
        accumulator.push(text);
    }
}
function parsePhrasingContent(element, accumulator) {
    if (element.type === 'image') {
        const imageBlock = slack_1.image(element.href, element.text || element.title || element.href, element.title);
        accumulator.push(imageBlock);
    }
    else {
        const text = parseMrkdwn(element);
        addMrkdwn(text, accumulator);
    }
}
function parseParagraph(element) {
    return element.tokens.reduce((accumulator, child) => {
        parsePhrasingContent(child, accumulator);
        return accumulator;
    }, []);
}
function parseHeading(element) {
    return slack_1.header(element.tokens
        .flatMap(child => parsePlainText(child))
        .join(''));
}
function parseCode(element) {
    return slack_1.section(`\`\`\`\n${element.text}\n\`\`\``);
}
function parseRichTextElements(element, inheritedStyle = {}) {
    var _a;
    switch (element.type) {
        case 'strong':
            return element.tokens.flatMap(child => parseRichTextElements(child, {
                ...inheritedStyle,
                bold: true,
            }));
        case 'em':
            return element.tokens.flatMap(child => parseRichTextElements(child, {
                ...inheritedStyle,
                italic: true,
            }));
        case 'del':
            return element.tokens.flatMap(child => parseRichTextElements(child, {
                ...inheritedStyle,
                strike: true,
            }));
        case 'codespan': {
            const style = { ...inheritedStyle, code: true };
            return [{ type: 'text', text: element.text, style }];
        }
        case 'link': {
            const linkText = element.tokens
                .flatMap(child => parsePlainText(child))
                .join('');
            const hasStyle = Object.keys(inheritedStyle).length > 0;
            return [
                {
                    type: 'link',
                    url: element.href,
                    text: linkText,
                    ...(hasStyle && { style: inheritedStyle }),
                },
            ];
        }
        case 'text': {
            const hasStyle = Object.keys(inheritedStyle).length > 0;
            return [
                {
                    type: 'text',
                    text: element.text,
                    ...(hasStyle && { style: inheritedStyle }),
                },
            ];
        }
        case 'br':
            return [{ type: 'text', text: '\n' }];
        case 'image':
            return [{ type: 'text', text: (_a = element.title) !== null && _a !== void 0 ? _a : element.href }];
        case 'html':
            return [{ type: 'text', text: element.raw }];
        default:
            return [];
    }
}
function parseListItemRichText(item) {
    var _a;
    const paragraph = item.tokens[0];
    let elements = [];
    if (paragraph && paragraph.type === 'text' && ((_a = paragraph.tokens) === null || _a === void 0 ? void 0 : _a.length)) {
        elements = paragraph.tokens.flatMap(child => parseRichTextElements(child));
    }
    else if (paragraph) {
        elements = [{ type: 'text', text: paragraph.text || '' }];
    }
    return { type: 'rich_text_section', elements };
}
function flattenListToRuns(element, depth = 0) {
    const runs = [];
    const style = element.ordered ? 'ordered' : 'bullet';
    for (const item of element.items) {
        runs.push({ style, indent: depth, section: parseListItemRichText(item) });
        // Process nested lists within this item
        for (let i = 1; i < item.tokens.length; i++) {
            const token = item.tokens[i];
            if (token.type === 'list') {
                runs.push(...flattenListToRuns(token, depth + 1));
            }
        }
    }
    return runs;
}
function parseList(element) {
    var _a;
    const runs = flattenListToRuns(element);
    // Group consecutive runs with the same style and indent into rich_text_list elements
    const listElements = [];
    for (const run of runs) {
        const last = listElements[listElements.length - 1];
        if (last && last.style === run.style && ((_a = last.indent) !== null && _a !== void 0 ? _a : 0) === run.indent) {
            last.elements.push(run.section);
        }
        else {
            const listEl = {
                type: 'rich_text_list',
                style: run.style,
                elements: [run.section],
            };
            if (run.indent > 0) {
                listEl.indent = run.indent;
            }
            listElements.push(listEl);
        }
    }
    return { type: 'rich_text', elements: listElements };
}
function parseTableCell(cell) {
    const texts = cell.tokens.reduce((accumulator, child) => {
        parsePhrasingContentToStrings(child, accumulator);
        return accumulator;
    }, []);
    return { type: 'raw_text', text: texts.join(' ') };
}
function parseTableRow(row) {
    return row.map(cell => parseTableCell(cell));
}
function parseTable(element) {
    const alignMap = {
        left: 'left',
        center: 'center',
        right: 'right',
    };
    const columnSettings = element.align.map(a => ({
        align: (a && alignMap[a]) || 'left',
    }));
    const rows = [element.header, ...element.rows].map(row => parseTableRow(row));
    return slack_1.table(rows, columnSettings);
}
function parseBlockquote(element) {
    return element.tokens
        .filter((child) => child.type === 'paragraph')
        .flatMap(p => parseParagraph(p).map(block => {
        var _a, _b;
        if (isSectionBlock(block) && ((_b = (_a = block.text) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.includes('\n')))
            block.text.text = '> ' + block.text.text.replace(/\n/g, '\n> ');
        return block;
    }));
}
function parseThematicBreak() {
    return slack_1.divider();
}
function parseHTML(element) {
    const parser = new fast_xml_parser_1.XMLParser({ ignoreAttributes: false });
    const res = parser.parse(element.raw);
    if (res.img) {
        const tags = res.img instanceof Array ? res.img : [res.img];
        return tags
            .map((img) => {
            const url = img['@_src'];
            return slack_1.image(url, img['@_alt'] || url);
        })
            .filter((e) => !!e);
    }
    else
        return [];
}
function parseToken(token, options) {
    switch (token.type) {
        case 'heading':
            return [parseHeading(token)];
        case 'paragraph':
            return parseParagraph(token);
        case 'code':
            return [parseCode(token)];
        case 'blockquote':
            return parseBlockquote(token);
        case 'list':
            return [parseList(token)];
        case 'table':
            return [parseTable(token)];
        case 'hr':
            return [parseThematicBreak()];
        case 'html':
            return parseHTML(token);
        default:
            return [];
    }
}
function parseBlocks(tokens, options = {}) {
    return tokens.flatMap(token => parseToken(token, options));
}
exports.parseBlocks = parseBlocks;
//# sourceMappingURL=internal.js.map
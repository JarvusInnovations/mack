"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const slack = __importStar(require("../src/slack"));
const internal_1 = require("../src/parser/internal");
const marked_1 = require("marked");
describe('parser', () => {
    it('should parse basic markdown', () => {
        const tokens = marked_1.marked.lexer('**a ~b~** c[*d*](https://example.com)');
        const actual = internal_1.parseBlocks(tokens);
        const expected = [slack.section('*a ~b~* c<https://example.com|_d_> ')];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse header', () => {
        const tokens = marked_1.marked.lexer('# a');
        const actual = internal_1.parseBlocks(tokens);
        const expected = [slack.header('a')];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse thematic break', () => {
        const tokens = marked_1.marked.lexer('---');
        const actual = internal_1.parseBlocks(tokens);
        const expected = [slack.divider()];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse lists', () => {
        const tokens = marked_1.marked.lexer(`
    1. a
    2. b
    - c
    - d
    * e
    * f
    `
            .trim()
            .split('\n')
            .map(s => s.trim())
            .join('\n'));
        const actual = internal_1.parseBlocks(tokens);
        const expected = [
            {
                type: 'rich_text',
                elements: [
                    {
                        type: 'rich_text_list',
                        style: 'ordered',
                        elements: [
                            {
                                type: 'rich_text_section',
                                elements: [{ type: 'text', text: 'a' }],
                            },
                            {
                                type: 'rich_text_section',
                                elements: [{ type: 'text', text: 'b' }],
                            },
                        ],
                    },
                ],
            },
            {
                type: 'rich_text',
                elements: [
                    {
                        type: 'rich_text_list',
                        style: 'bullet',
                        elements: [
                            {
                                type: 'rich_text_section',
                                elements: [{ type: 'text', text: 'c' }],
                            },
                            {
                                type: 'rich_text_section',
                                elements: [{ type: 'text', text: 'd' }],
                            },
                        ],
                    },
                ],
            },
            {
                type: 'rich_text',
                elements: [
                    {
                        type: 'rich_text_list',
                        style: 'bullet',
                        elements: [
                            {
                                type: 'rich_text_section',
                                elements: [{ type: 'text', text: 'e' }],
                            },
                            {
                                type: 'rich_text_section',
                                elements: [{ type: 'text', text: 'f' }],
                            },
                        ],
                    },
                ],
            },
        ];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse images', () => {
        const tokens = marked_1.marked.lexer('![alt](url "title")![](url)');
        const actual = internal_1.parseBlocks(tokens);
        const expected = [
            slack.image('url', 'alt', 'title'),
            slack.image('url', 'url'),
        ];
        expect(actual).toStrictEqual(expected);
    });
});
it('should truncate basic markdown', () => {
    const a4000 = new Array(4000).fill('a').join('');
    const a3000 = new Array(3000).fill('a').join('');
    const tokens = marked_1.marked.lexer(a4000);
    const actual = internal_1.parseBlocks(tokens);
    const expected = [slack.section(a3000)];
    expect(actual.length).toStrictEqual(expected.length);
});
it('should truncate header', () => {
    const a200 = new Array(200).fill('a').join('');
    const a150 = new Array(150).fill('a').join('');
    const tokens = marked_1.marked.lexer(`# ${a200}`);
    const actual = internal_1.parseBlocks(tokens);
    const expected = [slack.header(a150)];
    expect(actual.length).toStrictEqual(expected.length);
});
it('should truncate image title', () => {
    const a3000 = new Array(3000).fill('a').join('');
    const a2000 = new Array(2000).fill('a').join('');
    const tokens = marked_1.marked.lexer(`![${a3000}](url)`);
    const actual = internal_1.parseBlocks(tokens);
    const expected = [slack.image('url', a2000)];
    expect(actual.length).toStrictEqual(expected.length);
});
//# sourceMappingURL=parser.spec.js.map
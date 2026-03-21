"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.image = exports.table = exports.header = exports.divider = exports.section = void 0;
const MAX_TEXT_LENGTH = 3000;
const MAX_HEADER_LENGTH = 150;
const MAX_IMAGE_TITLE_LENGTH = 2000;
const MAX_IMAGE_ALT_TEXT_LENGTH = 2000;
function section(text) {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: text.slice(0, MAX_TEXT_LENGTH),
        },
    };
}
exports.section = section;
function divider() {
    return {
        type: 'divider',
    };
}
exports.divider = divider;
function header(text) {
    return {
        type: 'header',
        text: {
            type: 'plain_text',
            text: text.slice(0, MAX_HEADER_LENGTH),
        },
    };
}
exports.header = header;
function table(rows, columnSettings) {
    return {
        type: 'table',
        rows,
        column_settings: columnSettings,
    };
}
exports.table = table;
function image(url, altText, title) {
    return {
        type: 'image',
        image_url: url,
        alt_text: altText.slice(0, MAX_IMAGE_ALT_TEXT_LENGTH),
        title: title
            ? {
                type: 'plain_text',
                text: title.slice(0, MAX_IMAGE_TITLE_LENGTH),
            }
            : undefined,
    };
}
exports.image = image;
//# sourceMappingURL=slack.js.map
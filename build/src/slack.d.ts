import type { DividerBlock, HeaderBlock, ImageBlock, SectionBlock, TableBlock } from '@slack/types';
export declare function section(text: string): SectionBlock;
export declare function divider(): DividerBlock;
export declare function header(text: string): HeaderBlock;
export declare function table(rows: {
    type: 'raw_text';
    text: string;
}[][], columnSettings?: {
    align?: 'left' | 'center' | 'right';
}[]): TableBlock;
export declare function image(url: string, altText: string, title?: string): ImageBlock;

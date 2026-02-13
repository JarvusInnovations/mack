import {markdownToBlocks} from '../src';
import {section, header, image, table} from '../src/slack';
const slack = {section, header, image, table};

describe('integration with unified', () => {
  it('should parse raw markdown into slack blocks', async () => {
    const text = `
a **b** _c_ **_d_ e**

# heading **a**

![59953191-480px](https://user-images.githubusercontent.com/16073505/123464383-b8715300-d5ba-11eb-8586-b1f965e1f18d.jpg)

<img src="https://user-images.githubusercontent.com/16073505/123464383-b8715300-d5ba-11eb-8586-b1f965e1f18d.jpg" alt="59953191-480px"/>

> block quote **a**
> block quote b

[link](https://apple.com)

- bullet _a_
- bullet _b_

1. number _a_
2. number _b_

- [ ] checkbox false
- [x] checkbox true

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |
`;

    const actual = await markdownToBlocks(text);

    const expected = [
      slack.section('a *b* _c_ *_d_ e*'),
      slack.header('heading a'),
      slack.image(
        'https://user-images.githubusercontent.com/16073505/123464383-b8715300-d5ba-11eb-8586-b1f965e1f18d.jpg',
        '59953191-480px'
      ),
      slack.image(
        'https://user-images.githubusercontent.com/16073505/123464383-b8715300-d5ba-11eb-8586-b1f965e1f18d.jpg',
        '59953191-480px'
      ),
      slack.section('> block quote *a*\n> block quote b'),
      slack.section('<https://apple.com|link> '),
      {
        type: 'rich_text',
        elements: [
          {
            type: 'rich_text_list',
            style: 'bullet',
            elements: [
              {
                type: 'rich_text_section',
                elements: [
                  {type: 'text', text: 'bullet '},
                  {type: 'text', text: 'a', style: {italic: true}},
                ],
              },
              {
                type: 'rich_text_section',
                elements: [
                  {type: 'text', text: 'bullet '},
                  {type: 'text', text: 'b', style: {italic: true}},
                ],
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
            style: 'ordered',
            elements: [
              {
                type: 'rich_text_section',
                elements: [
                  {type: 'text', text: 'number '},
                  {type: 'text', text: 'a', style: {italic: true}},
                ],
              },
              {
                type: 'rich_text_section',
                elements: [
                  {type: 'text', text: 'number '},
                  {type: 'text', text: 'b', style: {italic: true}},
                ],
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
                elements: [{type: 'text', text: 'checkbox false'}],
              },
              {
                type: 'rich_text_section',
                elements: [{type: 'text', text: 'checkbox true'}],
              },
            ],
          },
        ],
      },
      slack.table(
        [
          [
            {type: 'raw_text', text: 'Syntax'},
            {type: 'raw_text', text: 'Description'},
          ],
          [
            {type: 'raw_text', text: 'Header'},
            {type: 'raw_text', text: 'Title'},
          ],
          [
            {type: 'raw_text', text: 'Paragraph'},
            {type: 'raw_text', text: 'Text'},
          ],
        ],
        [{align: 'left'}, {align: 'left'}]
      ),
    ];

    expect(actual).toStrictEqual(expected);
  });

  it('should parse long markdown', async () => {
    const text: string = new Array(3500).fill('a').join('') + 'bbbcccdddeee';

    const actual = await markdownToBlocks(text);

    const expected = [slack.section(text.slice(0, 3000))];

    expect(actual).toStrictEqual(expected);
  });

  describe('code blocks', () => {
    it('should parse code blocks with no language', async () => {
      const text = `\`\`\`
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``;

      const actual = await markdownToBlocks(text);

      const expected = [
        slack.section(
          `\`\`\`
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``
        ),
      ];

      expect(actual).toStrictEqual(expected);
    });

    it('should parse code blocks with language', async () => {
      const text = `\`\`\`javascript
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``;

      const actual = await markdownToBlocks(text);

      const expected = [
        slack.section(
          `\`\`\`
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``
        ),
      ];

      expect(actual).toStrictEqual(expected);
    });
  });

  it('should correctly escape text', async () => {
    const actual = await markdownToBlocks('<>&\'""\'&><');
    const expected = [slack.section('&lt;&gt;&amp;\'""\'&amp;&gt;&lt;')];
    expect(actual).toStrictEqual(expected);
  });

  describe('HTML entity decoding', () => {
    it('should decode named entities', async () => {
      const actual = await markdownToBlocks('A &amp; B');
      const expected = [slack.section('A &amp; B')];
      expect(actual).toStrictEqual(expected);
    });

    it('should decode &lt; and &gt; entities', async () => {
      const actual = await markdownToBlocks('&lt;div&gt;');
      const expected = [slack.section('&lt;div&gt;')];
      expect(actual).toStrictEqual(expected);
    });

    it('should decode numeric entities', async () => {
      const actual = await markdownToBlocks('&#38; &#60; &#62;');
      const expected = [slack.section('&amp; &lt; &gt;')];
      expect(actual).toStrictEqual(expected);
    });

    it('should decode hex entities', async () => {
      const actual = await markdownToBlocks('&#x26; &#x3C; &#x3E;');
      const expected = [slack.section('&amp; &lt; &gt;')];
      expect(actual).toStrictEqual(expected);
    });

    it('should decode &copy; entity', async () => {
      const actual = await markdownToBlocks('&#169; 2024');
      const expected = [slack.section('\u00A9 2024')];
      expect(actual).toStrictEqual(expected);
    });

    it('should decode &quot; and &apos; entities', async () => {
      const actual = await markdownToBlocks(
        '&quot;hello&quot; &apos;world&apos;'
      );
      const expected = [slack.section('"hello" \'world\'')];
      expect(actual).toStrictEqual(expected);
    });

    it('should leave malformed entities as-is', async () => {
      const actual = await markdownToBlocks('&invalid; &#; &#xZZ;');
      const expected = [slack.section('&amp;invalid; &amp;#; &amp;#xZZ;')];
      expect(actual).toStrictEqual(expected);
    });

    it('should handle mixed entities and raw characters', async () => {
      const actual = await markdownToBlocks('A & B &amp; C');
      const expected = [slack.section('A &amp; B &amp; C')];
      expect(actual).toStrictEqual(expected);
    });

    it('should decode entities in inline code', async () => {
      const actual = await markdownToBlocks('here&#39;s the result');
      const expected = [slack.section("here's the result")];
      expect(actual).toStrictEqual(expected);
    });

    it('should decode &#39; in a full sentence', async () => {
      const actual = await markdownToBlocks(
        'Based on the analysis, here&#39;s the dependency table'
      );
      const expected = [
        slack.section("Based on the analysis, here's the dependency table"),
      ];
      expect(actual).toStrictEqual(expected);
    });
  });
});

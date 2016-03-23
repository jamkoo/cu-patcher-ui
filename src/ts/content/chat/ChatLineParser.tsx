/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { ChatTextParser, ChatTextParserToken } from './ChatTextParser';
import { chatConfig } from './ChatConfig';

import Emoji from './Emoji';
import Colors from './Colors';
import Links from './Links';
import Markdown from './Markdown';

class ChatLineParser {
  _key: number = 1;
  
  static LINK: number = ChatTextParser.TEXT + 1;
  static EMOJI: number = ChatTextParser.TEXT + 2;
  static MARKDOWN: number = ChatTextParser.TEXT + 3;
  static COLORS: number = ChatTextParser.TEXT + 4;

  _parseText(text: string) : JSX.Element[] {
    return [ <span key={this._key++}>{text}</span> ];
  }

  parseAction(text: string): JSX.Element[] {
    const html: JSX.Element[] = [];
    const content : JSX.Element[] = this.parse(text.substr(4).trim());
    html.push(<span key={this._key++} className="chat-line-action">&lt;{content}&gt;</span>);
    return html;
  }

  isAction(text: string) : boolean {
     return text.toLowerCase().substr(0, 4) === '/me ';
  }

  parse(text: string): JSX.Element[] {
    const keygen = () : number => { return this._key++; };
    const tokens : ChatTextParserToken[] = [];
    // Parsers which need recursion should be first
    if (chatConfig.SHOW_COLORS) {
      tokens.push({ token: ChatLineParser.COLORS, expr: Colors.createRegExp() });
    }
    if (chatConfig.SHOW_MARKDOWN) {
      tokens.push({ token: ChatLineParser.MARKDOWN, expr: Markdown.createRegExp() });
    }
    // Parsers with simple search/replace should be last
    tokens.push({ token: ChatLineParser.LINK, expr: Links.createRegExp()} );
    if (chatConfig.SHOW_EMOTICONS) {
      tokens.push({ token: ChatLineParser.EMOJI, expr: Emoji.createRegExp() });
    }
    // Run through each parser
    const parser : ChatTextParser = new ChatTextParser(tokens);
    return parser.parse(text, (token: number, text: string) => {
      switch(token) {
        case ChatLineParser.LINK: return Links.fromText(text, keygen);
        case ChatLineParser.EMOJI: return Emoji.fromText(text, keygen);
        case ChatLineParser.MARKDOWN: return Markdown.fromText(text, keygen);
        case ChatLineParser.COLORS: return Colors.fromText(text, keygen);
      }
      // treat everything else as just text
      return this._parseText(text);
    });
  }

}

export default ChatLineParser;

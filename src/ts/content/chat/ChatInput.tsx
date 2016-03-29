/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import * as events from '../../core/events';
import { UserInfo } from './User';
import ChatSession from './ChatSession';
import { chatState } from './ChatState';

export interface ChatInputState {};

export interface ChatInputProps {
  label: string;
  send: (text: string) => void;
  slashCommand: (command: string) => void;
};

class ChatInput extends React.Component<ChatInputProps, ChatInputState> {
  _privateMessageHandler: any;
  tabUserList: string[] = [];
  tabUserIndex: number = null;
  constructor(props: ChatInputProps) {
    super(props);
    this._privateMessageHandler = events.on('cse-chat-private-message', (name: string) => {
      this.privateMessage(name);
    });
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
  }
  componentWillUnmount() {
    if (this._privateMessageHandler) {
      events.off(this._privateMessageHandler);
    }
  }
  getInputNode() : any {
    return this.refs['new-text'];
  }
  render() {
    return (
      <div className="chat-input input-field">
        <label htmlFor="chat-text">Say something!</label>
        <input id="chat-text" ref="new-text" onKeyDown={this.keyDown} onKeyUp={this.keyUp} onChange={this.parseInput} type="text"/>
      </div>
    );
  }
  keyDown(e: any) : void {
    // Complete username on tab key (9)
    if (e.keyCode === 9) {
      e.preventDefault();
      if (! this.tabUserList.length) {
        const chat: ChatSession = chatState.get('chat');
        const lastWord: string = e.target.value.match(/\b([\S]+)$/)[1];
        const endChar: string = lastWord === e.target.value ? ': ' : ' ';
        const matchingUsers: string[] = [];
        chat.getRoom(chat.currentRoom).users.forEach((u: JSX.Element) => {
          if (u.props.info.name.substring(0, lastWord.length) === lastWord) {
            matchingUsers.push(u.props.info.name);
          }
        });
        if (matchingUsers.length) {
          this.tabUserList = matchingUsers;
          this.tabUserIndex = 0;
          e.target.value = e.target.value + matchingUsers[0].substring(lastWord.length) + endChar;
        }
      } else {
        const oldTabIndex: number = this.tabUserIndex;
        const newTabIndex: number = oldTabIndex + 1 > this.tabUserList.length - 1 ? 0 : oldTabIndex + 1;
        const endChar: string = e.target.value.slice(-2) === ': ' ? ': ' : ' ';
        e.target.value = e.target.value.replace(new RegExp(this.tabUserList[oldTabIndex] + ':? $'), this.tabUserList[newTabIndex]) + endChar;
        this.tabUserIndex = newTabIndex;
      }
    } else {
      this.tabUserList = [];
      this.tabUserIndex = null;
    }
  }
  keyUp(e: any) : void {
    // Send message on enter key (13)
    if (e.keyCode === 13) {
      this.send();
    }
  }
  parseInput(e: any) : void {
    // Need this for color code popup later?
    // console.log(e.target.value);
  }
  send() : void {
    const input: any = this.getInputNode();
    const value: string = input.value.trim();
    if (value[0] !== '/' || !this.props.slashCommand(value.substr(1))) {
      // not a recognised / command, send it
      this.props.send(value);
    }
    input.value = '';
    input.focus();
  }
  privateMessage(name: string) : void {
    const input: any = this.getInputNode();
    input.value = '/w ' + name + ' ';
    input.focus();
  }
}

export default ChatInput;

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
import AtUserList from './AtUserList';

export interface ChatInputState {
  atUsers: string[];
  atUsersIndex: number;
};

export interface ChatInputProps {
  label: string;
  send: (text: string) => void;
  slashCommand: (command: string) => void;
};

class ChatInput extends React.Component<ChatInputProps, ChatInputState> {
  _privateMessageHandler: any;
  tabUserList: string[] = [];
  tabUserIndex: number = null;
  selectAtUser = (user: string) => {
    const input: any = this.getInputNode();
    const lastWord: RegExpMatchArray = input.value.match(/@([\S]*)$/);
    input.value = input.value.substring(0, lastWord.index + 1) + user + ' ';
    input.focus();
    this.setState({ atUsers: [], atUsersIndex: 0 });
  }
  constructor(props: ChatInputProps) {
    super(props);
    this.state = this.initialState();
    this._privateMessageHandler = events.on('cse-chat-private-message', (name: string) => {
      this.privateMessage(name);
    });
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
    this.parseInput = this.parseInput.bind(this);
  }
  initialState(): ChatInputState {
    return {
      atUsers: [],
      atUsersIndex: 0
    }
  }
  componentWillUnmount() {
    if (this._privateMessageHandler) {
      events.off(this._privateMessageHandler);
    }
  }
  getInputNode() : any {
    return this.refs['new-text'];
  }
  keyDown(e: any) : void {
    // Complete username on tab key (9 = tab)
    if (e.keyCode === 9) {
      e.preventDefault();
      if (!this.tabUserList.length) {
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
          this.setState({ atUsers: [], atUsersIndex: 0 });
        }
      } else {
        const oldTabIndex: number = this.tabUserIndex;
        const newTabIndex: number = oldTabIndex + 1 > this.tabUserList.length - 1 ? 0 : oldTabIndex + 1;
        const endChar: string = e.target.value.slice(-2) === ': ' ? ': ' : ' ';
        e.target.value = e.target.value.replace(new RegExp(this.tabUserList[oldTabIndex] + ':? $'), this.tabUserList[newTabIndex]) + endChar;
        this.tabUserIndex = newTabIndex;
        this.setState({ atUsers: [], atUsersIndex: 0 });
      }
    } else {
      this.tabUserList = [];
      this.tabUserIndex = null;
    }

    // Allow selection of atUser names with arrow keys (38 = up / 40 = down)
    if (e.keyCode === 38 && this.state.atUsers.length > 0) {
      e.preventDefault();
      const newIndex: number = this.state.atUsersIndex - 1 === -1 ? this.state.atUsers.length - 1 : this.state.atUsersIndex - 1;
      this.setState(
        {
          atUsers: this.state.atUsers,
          atUsersIndex: newIndex
        }
      );
    }
    if (e.keyCode === 40 && this.state.atUsers.length > 0) {
      e.preventDefault();
      const newIndex: number = this.state.atUsersIndex + 1 > this.state.atUsers.length - 1 ? 0 : this.state.atUsersIndex + 1;
      this.setState(
        {
          atUsers: this.state.atUsers,
          atUsersIndex: newIndex
        }
      );
    }
  }
  keyUp(e: any) : void {
    // Send message on enter key (13 = enter)
    if (e.keyCode === 13) {
      if (this.state.atUsers.length > 0) {
        e.preventDefault();
        this.selectAtUser(this.state.atUsers[this.state.atUsersIndex]);
      } else {
        this.send();
      }
    }
  }
  parseInput(e: any) : void {
    // Handle @name completion
    const lastWord: RegExpMatchArray = e.target.value.match(/(?:^|\s)@([\S]*)$/);
    const userList: string[] = [];
    const userFilter: string = lastWord && lastWord[1] ? lastWord[1] : '';
    if (lastWord) {
      const chat: ChatSession = chatState.get('chat');
      chat.getRoom(chat.currentRoom).users.forEach((u: JSX.Element) => {
        if (userFilter.length === 0 || u.props.info.name.toLowerCase().indexOf(userFilter.toLowerCase()) !== -1) {
          userList.push(u.props.info.name);
        }
      });
      userList.sort();
    }
    this.setState(
      {
        atUsers: userList,
        atUsersIndex: this.state.atUsersIndex
      }
    );
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
  render() {
    return (
      <div className='chat-input input-field'>
        <AtUserList users={this.state.atUsers} selectedIndex={this.state.atUsersIndex} selectUser={this.selectAtUser}/>
        <label htmlFor='chat-text'>Say something!</label>
        <input id='chat-text' ref='new-text' onKeyDown={this.keyDown} onKeyUp={this.keyUp} onChange={this.parseInput} type='text'/>
      </div>
    );
  }
}

export default ChatInput;

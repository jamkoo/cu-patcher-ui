/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import ChatText from './ChatText';
import ChatInput from './ChatInput';
import ChatLine from './ChatLine';
import ChatRoomInfo from './ChatRoomInfo';
import { ChatMessage } from './ChatMessage';
import RoomId from './RoomId';

export interface ContentState {
}
export interface ContentProps {
  room: ChatRoomInfo;                   // current room
  send: (roomId: RoomId, text: string) => void;
  slashCommand: (command: string) => void;
}

class Content extends React.Component<ContentProps, ContentState> {
  send = (text: string) : void => {
    this.props.send(this.props.room.roomId, text);
  }

  render() {
    return (
      <div className="chat-content">
        <ChatText room={this.props.room}/>
        <ChatInput label="SEND" send={this.send} slashCommand={this.props.slashCommand}/>
      </div>
    );
  }
}

export default Content;

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {patcher, Channel} from '../../api/PatcherAPI';

// action types
const CHANGE_CHANNEL = 'cse-patcher/locations/CHANGE_CHANNEL';
const REQUEST_CHANNELS = 'cse-patcher/locations/REQUEST_CHANNELS';

// sync actions
export function changeChannel(id: number): any {
  return {
    type: CHANGE_CHANNEL,
    channelId: id
  };
}

export function requestChannels(): any {
  return {
    type: REQUEST_CHANNELS,
    channels: patcher.getAllChannels()
  };
}

// reducer
const initialState = {
  currentChannel: 0,
  channels: <Array<Channel>>[]
}

export default function reducer(state: any = initialState, action: any = {}) {
  switch(action.type) {
    case CHANGE_CHANNEL:
      return Object.assign({}, state, {
        currentChannel: state.channels.findIndex((c: Channel) => c.channelID === action.channelId)
      });
    case REQUEST_CHANNELS:
      return Object.assign({}, state, {
        channels: action.channels
      });  
    default: return state;
  }
}

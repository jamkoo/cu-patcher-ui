/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Promise} from 'es6-promise';
import 'isomorphic-fetch';

import ResponseError from '../../core/ResponseError';
import {fetchJSON} from '../../core/fetchHelpers';

const serversUrl = 'http://api.camelotunchained.com/servers';

export interface Server {
  accessLevel: number,
  host: string,
  name: string,
  playerMaximum: string,
  channelID: number,
  shardID: number
}

// action types
const FETCH_SERVERS = 'cse-patcher/servers/FETCH_SERVERS';
const FETCH_SERVERS_SUCCESS = 'cse-patcher/servers/FETCH_SERVERS_SUCCESS';
const FETCH_SERVERS_FAILED = 'cse-patcher/servers/FETCH_SERVERS_FAILED';
const CHANGE_SERVER = 'cse-patcher/servers/CHANGE_SERVER';

// sync actions
export function requestServers() {
  return {
    type: FETCH_SERVERS
  };
}

export function fetchServersSuccess(servers: Array<Server>) {
  return {
    type: FETCH_SERVERS_SUCCESS,
    servers: servers,
    receivedAt: Date.now()
  };
}

export function fetchServersFailed(error: ResponseError) {
  return {
    type: FETCH_SERVERS_FAILED,
    error: error
  };
}

export function changeServer(name: string): any {
  return {
    type: CHANGE_SERVER,
    name: name
  };
}

// async actions
export function fetchServers() {
  return (dispatch: (action: any) => any) => {
    dispatch(requestServers());
    return fetchJSON(serversUrl)
      .then((servers: Array<Server>) => dispatch(fetchServersSuccess(servers)))
      .catch((error: ResponseError) => dispatch(fetchServersFailed(error)));
  }
}

// reducer
const initialState = {
  isFetching: false,
  lastUpdated: <Date>null,
  servers: <Array<Server>>[],
  currentServer: 0,
}

export default function reducer(state: any = initialState, action: any = {}) {
  switch(action.type) {
    case FETCH_SERVERS:
      return Object.assign({}, state, {
        isFetching: true
      });
    case FETCH_SERVERS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        lastUpdated: action.receivedAt,
        servers: action.servers
      });
    case FETCH_SERVERS_FAILED:
      return Object.assign({}, state, {
          isFetching: false,
          error: action.error
        });
    case CHANGE_SERVER: 
      return Object.assign({}, state, {
        currentServer: state.servers.findIndex((s: Server) => s.name == action.name)
      });
    default: return state;
  }
}
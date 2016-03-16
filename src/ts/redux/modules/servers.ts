/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Promise} from 'es6-promise';
import 'isomorphic-fetch';

import {patcher} from '../../api/patcherAPI';

import ResponseError from '../../core/ResponseError';
import {fetchJSON} from '../../core/fetchHelpers';

const serversUrl = 'http://api.camelotunchained.com/servers';

export interface Server {
  accessLevel: number,
  host: string,
  name: string,
  playerMaximum: number,
  channelID: number,
  shardID: number,
  arthurians?: number,
  tuathaDeDanann?: number,
  vikings?: number,
  max?: number,
}


function OfflineServer(name: string, channel: number, shardID: number) :Server {
  return {
    accessLevel: 0,
    host: '',
    name: name,
    playerMaximum: 0,
    channelID: channel,
    shardID: shardID,
    arthurians: 0,
    tuathaDeDanann: 0,
    vikings: 0,
    max: 0,
  } as Server;
}

// action types
const FETCH_SERVERS = 'cse-patcher/servers/FETCH_SERVERS';
const FETCH_SERVERS_SUCCESS = 'cse-patcher/servers/FETCH_SERVERS_SUCCESS';
const FETCH_SERVERS_FAILED = 'cse-patcher/servers/FETCH_SERVERS_FAILED';
const CHANGE_SERVER = 'cse-patcher/servers/CHANGE_SERVER';
const UPDATE_SERVER = 'cse-patcher/servers/UPDATE_SERVER';

// sync actions
export function requestServers() {
  return {
    type: FETCH_SERVERS
  };
}

export function fetchServersSuccess(servers: Array<Server>) {
  let hatchery = servers.find(s => s.name === 'Hatchery');
  let wyrmling = servers.find(s => s.name === 'Wyrmling');
  if (!hatchery) servers.unshift(OfflineServer('Hatchery', 4, 1))
  if (!wyrmling) servers.unshift(OfflineServer('Wyrmling', 10, 1))
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

export function updateServer(server: Server) {
  return {
    type: UPDATE_SERVER,
    server: server
  };
}

// async actions
export function fetchServers() {
  return (dispatch: (action: any) => any) => {
    dispatch(requestServers());
    return fetchJSON(serversUrl)
      .then((servers: Array<Server>) => {
        servers.forEach((s: Server) => {
          if (s.name === 'localhost' && patcher.getScreenName().indexOf('cse') == -1) return;
          fetchJSON(`http://${s.host}:8000/api/game/players`)
            .then((players: any) => {
              s.arthurians = players.arthurians;
              s.vikings = players.vikings;
              s.tuathaDeDanann = players.tuathaDeDanann;
              s.playerMaximum = players.max;
              dispatch(updateServer(s));
            })
            .catch((error: ResponseError) => {/*ignore error*/});
        })
        //dispatch(fetchServersSuccess(servers))
      })
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
    case UPDATE_SERVER:
      let servers = state.servers;
      const index = servers.findIndex((s: Server) => s.name == action.server.name);
      if (index > -1) servers[index] = action.server;
      else servers.push(action.server);
      return Object.assign({}, state, {
        servers: servers
      });
    default: return state;
  }
}
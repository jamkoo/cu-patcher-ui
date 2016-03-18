/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Promise} from 'es6-promise';
import 'isomorphic-fetch';

import ResponseError from '../../core/ResponseError';
import {fetchJSON} from '../../core/fetchHelpers';

import {restAPI, archetype, faction} from 'camelot-unchained';
import {patcher} from '../../api/patcherAPI';

const charactersUrl = 'https://api.camelotunchained.com/characters';

function selectNewCharacter() {
  return {
    name: 'create new character',
    archetype: archetype.NONE,
    id: '',
    shardID: 0,
  } as restAPI.SimpleCharacter;
}

// action types
const FETCH_CHARACTERS = 'cse-patcher/characters/FETCH_CHARACTERS';
const FETCH_CHARACTERS_SUCCESS = 'cse-patcher/characters/FETCH_CHARACTERS_SUCCESS';
const FETCH_CHARACTERS_FAILED = 'cse-patcher/characters/FETCH_CHARACTERS_FAILED';
const SELECT_CHARACTER = 'cse-patcher/characters/SELECT_CHARACTER';

// sync actions
export function requestCharacters() {
  return {
    type: FETCH_CHARACTERS
  };
}

export function fetchCharactersSuccess(characters: Array<restAPI.SimpleCharacter>) {
  characters.unshift(selectNewCharacter());
  return {
    type: FETCH_CHARACTERS_SUCCESS,
    characters: characters,
    receivedAt: Date.now()
  };
}

export function fetchCharactersFailed(error: ResponseError) {
  return {
    type: FETCH_CHARACTERS_FAILED,
    error: error
  };
}

export function selectCharacter(character: restAPI.SimpleCharacter) {
  return {
    type: SELECT_CHARACTER,
    character: character
  };
}

// async actions
export function fetchCharacters() {
  return (dispatch: (action: any) => any) => {
    dispatch(requestCharacters());
    // not using the restAPI getcharacters because the internal loginToken
    // stuff does not work with the patcher
    return fetchJSON(`${charactersUrl}?loginToken=${patcher.getLoginToken()}`)
      .then((characters: Array<restAPI.SimpleCharacter>) => dispatch(fetchCharactersSuccess(characters)))
      .catch((error: ResponseError) => dispatch(fetchCharactersFailed(error)));
  };
}

// reducer
export interface CharactersState {
  isFetching?: boolean;
  lastUpdated?: Date;
  characters?: Array<restAPI.SimpleCharacter>;
  selectedCharacter?: restAPI.SimpleCharacter;
  error?: string;
}

const initialState = {
  isFetching: false,
  lastUpdated: <Date>null,
  characters: <Array<restAPI.SimpleCharacter>>[selectNewCharacter()],
  selectedCharacter: selectNewCharacter()
}

export default function reducer(state: CharactersState = initialState, action: any = {}) {
  switch(action.type) {
    case FETCH_CHARACTERS:
      return Object.assign({}, state, {
        isFetching: true
      });
    case FETCH_CHARACTERS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        lastUpdated: action.receivedAt,
        characters: action.characters
      });
    case FETCH_CHARACTERS_FAILED:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });
    case SELECT_CHARACTER:
      return Object.assign({}, state, {
        selectedCharacter: action.character
      });
    default: return state;
  }
}

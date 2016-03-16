/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {components, race, restAPI} from 'camelot-unchained';
let QuickSelect = components.QuickSelect;

export interface ActiveCharacterViewProps {
  item: restAPI.SimpleCharacter;
};
export interface ActiveCharacterViewState {};
class ActiveCharacterView extends React.Component<ActiveCharacterViewProps, ActiveCharacterViewState> {
  render() {
    return (
      <div className='character-select quickselect-active'>
        <h5 className='label'>SELECT CHARACTER</h5>
        <div>
          <div className='character-status'><div className={'indicator tooltipped ' + status} data-position='right'
            data-delay='150' data-tooltip={status} /></div>
          <div className='character-details'>
            <h6 className={`character char-${race[this.props.item.race]}`}>{this.props.item.name}</h6>
          </div>
        </div>
      </div>
    );
  }
}

export interface CharacterListViewProps {
  item: restAPI.SimpleCharacter;
};
export interface CharacterListViewState {};
class CharacterListView extends React.Component<CharacterListViewProps, CharacterListViewState> {
  render() {
    return (
      <div className='character-select quickselect-list'>
        <div>
          <div className='character-status'><div className={'indicator tooltipped ' + status} data-position='right'
            data-delay='150' data-tooltip={status} /></div>
          <div className='character-details'>
            <h6 className={`character char-${race[this.props.item.race]}`}>{this.props.item.name}</h6>
          </div>
        </div>
      </div>
    );
  }
}

export interface CharacterSelectProps {
  characters: Array<restAPI.SimpleCharacter>;
  selectedCharacter: restAPI.SimpleCharacter,
  onCharacterSelectionChanged: (id: string) => void;
};

export interface CharacterSelectState {
};

class CharacterSelect extends React.Component<CharacterSelectProps, CharacterSelectState> {
  public name: string = 'cse-patcher-Character-select';
  
  constructor(props: CharacterSelectProps) {
    super(props);
  }
  
  onSelectedCharacterChanged = (character: any) => {
    this.props.onCharacterSelectionChanged(character.id);
  }
  
  generateActiveView = (character: any) => {
    return <ActiveCharacterView item={character} />
  }
  
  generateListView = (character: any) => {
    return <CharacterListView item={character} />
  }
  
  render() {
    if (this.props.characters.length == 0) return <div>Create new character.</div>;
    return (
        <QuickSelect items={this.props.characters} activeViewComponentGenerator={this.generateActiveView}
          listViewComponentGenerator={this.generateListView} onSelectedItemChanged={this.onSelectedCharacterChanged} />
    );
  }
}

export default CharacterSelect;

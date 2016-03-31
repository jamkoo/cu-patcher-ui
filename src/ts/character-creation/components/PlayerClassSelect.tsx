/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';

import {archetype, faction} from 'camelot-unchained';
import {PlayerClassInfo} from '../redux/modules/playerClasses';

const classText: any = {
  'BLACKKNIGHT': 'foo things and stuff',


}

export interface PlayerClassSelectProps {
  classes: Array<PlayerClassInfo>;
  selectedClass: PlayerClassInfo;
  selectClass: (playerClass: PlayerClassInfo) => void;
  faction: faction;
}

export interface PlayerClassSelectState {
}

class PlayerClassSelect extends React.Component<PlayerClassSelectProps, PlayerClassSelectState> {

  constructor(props: PlayerClassSelectProps) {
    super(props);
  }

  selectClass = (info: PlayerClassInfo) => {
    this.props.selectClass(info);
  }

  generateClassContent = (info: PlayerClassInfo) => {
    return (
      <a key={info.id}
              className={`cu-character-creation__class-select__${archetype[info.id]} ${this.props.selectedClass !== null ? this.props.selectedClass.id == info.id ? 'active' : '' : ''}`}
              onClick={this.selectClass.bind(this, info)}></a>
    );
  }

  render() {
    if (!this.props.classes) return <div> loading classes</div>;

    let view: any = null;
    let text: any = null;
    let name: any = null;
    if (this.props.selectedClass) {
      name = <h2 className={`cu-character-creation__race-select_name`}>{this.props.selectedClass.name}</h2>
      view = <div className={`cu-character-creation__race-select__view-area__${archetype[this.props.selectedClass.id]}`}></div>
      text = <div className='cu-character-creation__race-select__text'>{this.props.selectedClass.description}</div>
    }

    return (
      <div className='cu-character-creation__race-select'>
          {name}
        <div className='cu-character-creation__race-select__selection-area'>
          <h6>Choose your class</h6>
          {this.props.classes.filter((c:any) => c.faction === this.props.faction || c.faction == faction.FACTIONLESS).map(this.generateClassContent)}
          {text}
        </div>
        <div className='cu-character-creation__race-select__view-area'>
          {view}
        </div>
      </div>
    )
  }
}

export default PlayerClassSelect;

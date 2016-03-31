/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {race, gender} from 'camelot-unchained';
import {AttributeInfo} from '../redux/modules/attributes';
import {AttributeOffsetInfo} from '../redux/modules/attributeOffsets';


export interface AttributesSelectProps {
  attributes: Array<AttributeInfo>;
  attributeOffsets: Array<AttributeOffsetInfo>;
  selectedRace: race;
  selectedGender: gender;
  remainingPoints: number;
  allocatePoint: (name: string, value: number) => void;
}

export interface AttributesSelectState {
}

class AttributesSelect extends React.Component<AttributesSelectProps, AttributesSelectState> {

  private maxAllotments: any;
  private allotments: any;

  constructor(props: AttributesSelectProps) {
    super(props);
    this.allotments = [] as any;
  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  generateAttributeContent = (attributeInfo: AttributeInfo, offset: AttributeOffsetInfo) => {
    if (attributeInfo.type !== 1) return null;
    let allocatedCount = 0;//this.props.allocations[attributeInfo.name]
    let offsetValue = offset == null ? 0 : typeof offset.attributeOffsets[attributeInfo.name] === 'undefined' ? 0 : offset.attributeOffsets[attributeInfo.name];
    return (
      <div key={attributeInfo.name} className={`cu-character-creation__attributes__attribute-select--${attributeInfo.name}`}>
        <div>
          <span className='hint--right hint--slide' data-hint={attributeInfo.description}>{attributeInfo.name} </span>
          <button className='leftarrow' onClick={() => this.props.allocatePoint(attributeInfo.name, -1)}></button>
          <span className='attribute-points'>{attributeInfo.baseValue + attributeInfo.allocatedPoints + offsetValue}</span>
          <button className='rightarrow' onClick={() => this.props.allocatePoint(attributeInfo.name, 1)} ></button>
        </div>
      </div>
    );
  }

  render() {
    if (typeof (this.props.attributes) === 'undefined') {
      return <div> loading attributes </div>
    }
    let offset = this.props.attributeOffsets.find((o: AttributeOffsetInfo) => o.gender == this.props.selectedGender && o.race == this.props.selectedRace);
    if (typeof offset === 'undefined') offset = null;
    return (
      <div className='cu-character-creation__attribute-select'>
        <div className='cu-character-creation__attribute-select__selection-area'>
          <h6>Distribute attribute points  <span className='points'>(Remaining {this.props.remainingPoints})</span></h6>
          {this.props.attributes.map((a: AttributeInfo) => this.generateAttributeContent(a, offset))}
        </div>
        <div>
        </div>
      </div>
    )
  }
}

export default AttributesSelect;

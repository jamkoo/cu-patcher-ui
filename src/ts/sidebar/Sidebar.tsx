/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {components, race, restAPI} from 'camelot-unchained';
let QuickSelect = components.QuickSelect;
declare let $: any;

import Login from './Login';
import ChannelSelect from './ChannelSelect';
import ServerSelect, {ServerStatus} from './ServerSelect';
import PatchButton from './PatchButton';
import ServerCounts from './ServerCounts';
import CharacterSelect from './CharacterSelect';
import Alerts from './Alerts';

import {PatcherAlert} from '../redux/modules/patcherAlerts';
import {patcher, Channel} from '../api/PatcherAPI';
import {Server} from '../redux/modules/servers';

export interface SidebarProps {
  alerts: Array<PatcherAlert>,
  currentChannel: Channel;
  channels: Array<Channel>;
  onApiUpdated: () => void,
  changeChannel: (channel: Channel) => void;
  playSelect: () => void;
  playLaunch: () => void;
  playPatchComplete: () => void;
  servers: Array<Server>,
  currentServerIndex: number,
  characters: Array<restAPI.SimpleCharacter>;
  selectedCharacterId: string,
  fetchCharacters: () => void;
  selectCharacter: (id: string) => void;
};

export interface SidebarState {
  loggedIn: boolean;
  activeServer: Server;
};

class Sidebar extends React.Component<SidebarProps, SidebarState> {
  public name = 'cse-patcher-sidebar';
  
  static propTypes = {
    alerts: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  }

  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      loggedIn: false,
      activeServer: null
    };
  }
  
  onLogIn = () => {
    this.setState({
     loggedIn: true,
     activeServer: this.state.activeServer
    });
    this.props.onApiUpdated();
    this.props.fetchCharacters();
  }
  
  onLogOut = () => {
    
  }
  
  initjQueryObjects = () => {
    $('.dropdown-button').dropdown();
    //$('.tooltipped').tooltip();
  }
  
  getChannels = () => {
    return [{name: 'Hatchery'}, {name: 'Wyrmling'}];
  }
  
  getCharacters = () => {
    return [{
      name: 'Create new character',
      race: race.NONE
    },{
      name: 'CSE JB [STRM]',
      race: race.STRM
    },{
      name: 'CSE JB [DRYAD]',
      race: race.HAMADRYAD
    }];
  }
  
  onSelectedServerChanged = (server: any) => {
    this.setState({
      loggedIn: this.state.loggedIn,
      activeServer: server
    });
    this.props.playSelect();
  }
  
  onSelectedChannelChanged = (channel: Channel) => {
    this.props.changeChannel(channel);
    this.props.playSelect();
  }

  render() {
    if (!this.state.loggedIn) {
      return (
        <div id={this.name} className=''>
          <Login onLogIn={this.onLogIn} />
        </div>
      );
    }
    
    setTimeout(this.initjQueryObjects, 100);

    let selectedCharacter: restAPI.SimpleCharacter = null;
    let renderServerSection: any = null;
    let servers = this.props.servers.filter(s => s.channelID === this.props.currentChannel.channelID);
    let activeServer: Server = null;
    if (servers.length > 0) {
      activeServer = this.props.servers[this.props.currentServerIndex]
      let characters = this.props.characters.filter(c => c.shardID == activeServer.shardID || c.shardID == 0);
      selectedCharacter = characters.find(c => c.id == this.props.selectedCharacterId) || characters[0];
      renderServerSection = (
        <div>
          <ServerSelect servers={servers}
                        onSelectedServerChanged={this.onSelectedServerChanged} />
          <CharacterSelect characters={characters}
                           selectedCharacter={selectedCharacter}
                           onCharacterSelectionChanged={this.props.selectCharacter} />
          <ServerCounts artCount={activeServer.arthurians}
                        tddCount={activeServer.tuathaDeDanann}
                        vikCount={activeServer.vikings} />
        </div>
      );
    }

    return (
      <div id={this.name} className=''>
        <Alerts alerts={this.props.alerts} />
        <ChannelSelect channels={this.props.channels} onSelectedChannelChanged={this.onSelectedChannelChanged} />
        <div className='card-panel no-padding'>
          {renderServerSection}
          <PatchButton server={activeServer}
                      channel={this.props.currentChannel}
                       playSelect={this.props.playSelect}
                       playLaunch={this.props.playLaunch}
                       playPatchComplete={this.props.playPatchComplete}
                       character={selectedCharacter} />
        </div>
      </div>
    );
  }
};

export default Sidebar;

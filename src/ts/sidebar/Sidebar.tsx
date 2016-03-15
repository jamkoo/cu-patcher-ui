/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {components, race} from 'camelot-unchained';
let QuickSelect = components.QuickSelect;
declare let $: any;

import Login from './Login';
import ChannelSelect from './ChannelSelect';
import ServerSelect, {ServerStatus} from './ServerSelect';
import PatchButton from './PatchButton';
import ServerCounts from './ServerCounts';
import CharacterSelect, {Character} from './CharacterSelect';
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
};

export interface SidebarState {
  loggedIn: boolean;
  characters: Array<Character>;
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
      characters: this.getCharacters(),
      activeServer: null
    };
  }
  
  onLogIn = () => {
    this.setState({
     loggedIn: true,
     characters: this.state.characters,
     activeServer: this.state.activeServer
    });
    this.props.onApiUpdated();
  }
  
  onLogOut = () => {
    
  }
  
  initjQueryObjects = () => {
    $('.dropdown-button').dropdown();
    $('.tooltipped').tooltip();
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
      characters: this.state.characters,
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
    
    let servers = this.props.servers.filter(s => s.channelID === this.props.currentChannel.channelID);
    let activeServer = this.state.activeServer || this.props.servers[0];
    let characters = this.state.characters;
    setTimeout(this.initjQueryObjects, 100);

    return (
      <div id={this.name} className=''>
        <Alerts alerts={this.props.alerts} />
        <ChannelSelect channels={this.props.channels} onSelectedChannelChanged={this.onSelectedChannelChanged} />
        <div className='card-panel no-padding'>
          <ServerSelect servers={[]}
                        onSelectedServerChanged={this.onSelectedServerChanged} />
          <CharacterSelect characters={this.state.characters}/>
          <ServerCounts artCount={0}
                        tddCount={0}
                        vikCount={0} />
          <PatchButton channel={this.props.currentChannel}
                       playSelect={this.props.playSelect}
                       playLaunch={this.props.playLaunch}
                       playPatchComplete={this.props.playPatchComplete} />
        </div>
      </div>
    );
  }
};

export default Sidebar;

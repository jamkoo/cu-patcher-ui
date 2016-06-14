/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {connect} from 'react-redux';
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

import reducer from '../redux/modules/reducer';
import {fetchAlerts, validateAlerts, PatcherAlertsState} from '../redux/modules/patcherAlerts';
import {changeChannel, requestChannels, ChannelState} from '../redux/modules/channels';
import {muteSounds, unMuteSounds} from '../redux/modules/sounds';
import {muteMusic, unMuteMusic} from '../redux/modules/music';
import {fetchServers, changeServer, ServersState} from '../redux/modules/servers';
import {fetchCharacters, selectCharacter, CharactersState} from '../redux/modules/characters';

function select(state: any): any {
  return {
    channelsState: state.channels,
    patcherAlertsState: state.alerts,
    soundMuted: state.soundMuted,
    musicMuted: state.musicMuted,
    serversState: state.servers,
    charactersState: state.characters,
  }
}

export interface SidebarProps {
  dispatch?: (action: any) => void;
  channelsState?: ChannelState;
  patcherAlertsState?: PatcherAlertsState;
  soundMuted?: boolean;
  musicMuted?: boolean;
  serversState?: ServersState;
  charactersState?: CharactersState;
  onLogIn: () => void;
}

export interface SidebarState {
};

class Sidebar extends React.Component<SidebarProps, SidebarState> {
  public name = 'cse-patcher-sidebar';

  private alertsInterval: any = null;
  private channelInterval: any = null;
  private serversInterval: any = null;

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
    this.fetchCharacters();
    this.props.onLogIn();
    setTimeout(() => this.props.dispatch(requestChannels()), 500);
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

  fetchCharacters = () => {
    this.props.dispatch(fetchCharacters());
  }

  getCharacters = () => {
    return [{
      name: 'Create new character',
      race: race.NONE
    },{
      name: 'Test Strm',
      race: race.STRM
    },{
      name: 'Test Dryad',
      race: race.HAMADRYAD
    }];
  }

  playSelect = () => {
    if (!this.props.soundMuted) {
      (this.refs['sound-select'] as HTMLAudioElement).play();
      (this.refs['sound-select'] as HTMLAudioElement).volume = 0.75;
    }
  }

  playLaunchGame = () => {
    if (!this.props.soundMuted) {
      (this.refs['sound-launch-game'] as HTMLAudioElement).play();
      (this.refs['sound-launch-game'] as HTMLAudioElement).volume = 0.75;
    }
  }

  playPatchComplete = () => {
    if (!this.props.soundMuted) {
      (this.refs['sound-patch-complete'] as HTMLAudioElement).play();
      (this.refs['sound-patch-complete'] as HTMLAudioElement).volume = 0.75;
    }
  }

  onSelectedServerChanged = (server: Server) => {
    this.props.dispatch(changeServer(server));
    this.playSelect();
  }

  onSelectedChannelChanged = (channel: Channel) => {
    this.props.dispatch(changeChannel(channel));
    this.playSelect();
  }

  selectCharacter = (character: restAPI.SimpleCharacter) => {
    this.props.dispatch(selectCharacter(character));
  }

  componentDidMount() {
    // fetch initial alerts and then every minute validate & fetch alerts.
    if (!this.props.patcherAlertsState.isFetching) this.props.dispatch(fetchAlerts());
    this.alertsInterval = setInterval(() => {
      this.props.dispatch(validateAlerts());
      if (!this.props.patcherAlertsState.isFetching) this.props.dispatch(fetchAlerts());
    }, 60000);

    // fetch initial servers and then every 30 seconds fetch servers.
    if (!this.props.serversState.isFetching) this.props.dispatch(fetchServers());
    this.serversInterval = setInterval(() => {
      if (!this.props.serversState.isFetching) this.props.dispatch(fetchServers());
    }, 30000);

    // update channel info every 1 minute.
    this.props.dispatch(requestChannels());
    this.channelInterval = setInterval(() => {
      this.props.dispatch(requestChannels());
    }, 1000 * 60);

  }

  componentDidUnMount() {
    // unregister intervals
    clearInterval(this.alertsInterval);
    clearInterval(this.channelInterval);
    clearInterval(this.serversInterval);
  }

  render() {
    if (!patcher.hasLoginToken()) {
      return (
        <div id={this.name} className=''>
          <Login onLogIn={this.onLogIn} />
        </div>
      );
    }

    setTimeout(this.initjQueryObjects, 100);

    let renderServerSection: any = null;
    let activeServer: Server = null;
    let selectedCharacter: restAPI.SimpleCharacter = null;
    let selectedChannel: Channel = null;
    let selectedChannelIndex: number = -1;
    if (this.props.serversState.servers.length > 0 &&  typeof(this.props.channelsState.channels) !== 'undefined' && this.props.channelsState.channels.length > 0) {
      selectedChannel = this.props.channelsState.selectedChannel;
      selectedChannelIndex = this.props.channelsState.channels.findIndex(c => c.channelID == selectedChannel.channelID);

      if (typeof(selectedChannelIndex) == 'undefined') selectedChannelIndex = 0;

      let servers = this.props.serversState.servers.filter((s: Server) => s.channelID === selectedChannel.channelID);
      if (servers.length > 0) {
        if (this.props.serversState.currentServer) {
          for (let i: number = 0; i < servers.length; i++) {
            if (this.props.serversState.currentServer.name == servers[i].name) {
              activeServer = servers[i];
            }
          }
        }
        if (!activeServer) activeServer = servers[0];

        let characters = this.props.charactersState.characters.filter((c: restAPI.SimpleCharacter) => c.shardID == activeServer.shardID || c.shardID == 0);
        selectedCharacter = this.props.charactersState.selectedCharacter;
        renderServerSection = (
          <div>
            <ServerSelect servers={servers}
                          selectedServer={activeServer}
                          onSelectedServerChanged={this.onSelectedServerChanged} />
            <CharacterSelect characters={characters}
                             selectedCharacter={selectedCharacter}
                             onCharacterSelectionChanged={this.selectCharacter} />
            <ServerCounts artCount={activeServer.arthurians}
                          tddCount={activeServer.tuathaDeDanann}
                          vikCount={activeServer.vikings} />
          </div>
        );
      }
    }

    return (
      <div id={this.name} className=''>
        <Alerts alerts={this.props.patcherAlertsState.alerts} />
        <ChannelSelect channels={this.props.channelsState.channels} onSelectedChannelChanged={this.onSelectedChannelChanged} />
        <div className='card-panel no-padding'>
          {renderServerSection}
          <PatchButton server={activeServer}
                      channelIndex={selectedChannelIndex}
                       playSelect={this.playSelect}
                       playLaunch={this.playLaunchGame}
                       playPatchComplete={this.playPatchComplete}
                       character={selectedCharacter}
                       fetchCharacters={() => this.props.dispatch(fetchCharacters())} />
        </div>
      </div>
    );
  }
};

//export default Sidebar;
export default connect(select)(Sidebar);
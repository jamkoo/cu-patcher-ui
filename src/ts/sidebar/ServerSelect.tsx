/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {components} from 'camelot-unchained';
let QuickSelect = components.QuickSelect;

import {Server} from '../redux/modules/servers';

export enum ServerStatus {
  OFFLINE,
  ONLINE,
  STARTING
}

export interface ActiveServerViewProps {
  item: Server;
};

export interface ActiveServerViewState {};
class ActiveServerView extends React.Component<ActiveServerViewProps, ActiveServerViewState> {
  render() {
    let totalPlayers = this.props.item.arthurians + this.props.item.tuathaDeDanann + this.props.item.vikings;
    let status = this.props.item.playerMaximum > 0 ? 'online' : 'offline';
    return (
      <div className='server-select quickselect-active'>
        <h5 className='label'>SELECT SERVER</h5>
        <div>
          <div className='server-status'><div className={'indicator ' + status} data-position='right'
            data-delay='150' data-tooltip={status} /></div>
          <div className='server-details'>
            <h5 className='server'>{this.props.item.name}</h5>
            <h6>{totalPlayers}/{this.props.item.playerMaximum}</h6>
          </div>
        </div>
      </div>
    );
  }
}

export interface ServerListViewProps {
  item: Server;
};
export interface ServerListViewState {};
class ServerListView extends React.Component<ServerListViewProps, ServerListViewState> {
  render() {
    let totalPlayers = this.props.item.arthurians + this.props.item.tuathaDeDanann + this.props.item.vikings;
    let status = this.props.item.playerMaximum > 0 ? 'online' : 'offline';
    return (
      <div className='server-select quickselect-list'>
        <div>
          <div className='server-status'><div className={'indicator ' + status} data-position='right'
            data-delay='150' data-tooltip={status} /></div>
          <div className='server-details'>
            <h5 className='server'>{this.props.item.name}</h5>
            <h6>{totalPlayers}/{this.props.item.playerMaximum}</h6>
          </div>
        </div>
      </div>
    );
  }
}

export interface ServerSelectProps {
  servers: Array<Server>;
  onSelectedServerChanged: (server: Server) => void;
};

export interface ServerSelectState {
  activeServerIndex: number;
};

class ServerSelect extends React.Component<ServerSelectProps, ServerSelectState> {
  public name: string = 'cse-patcher-server-select';
  
  constructor(props: ServerSelectProps) {
    super(props);
    this.state = {
      activeServerIndex: 0
    }
  }
  
  onSelectedServerChanged = (server: any) => {
    this.setState({
      activeServerIndex: this.props.servers.indexOf(server) 
    });
    this.props.onSelectedServerChanged(server);
  }
  
  generateActiveView = (server: any) => {
    return <ActiveServerView item={server} />
  }
  
  generateListView = (server: any) => {
    return <ServerListView item={server} />
  }
  
  render() {
    if (this.props.servers.length == 0) return null;
    return (
        <QuickSelect items={this.props.servers} activeViewComponentGenerator={this.generateActiveView}
          listViewComponentGenerator={this.generateListView} onSelectedItemChanged={this.onSelectedServerChanged} />
    );
  }
}

export default ServerSelect;

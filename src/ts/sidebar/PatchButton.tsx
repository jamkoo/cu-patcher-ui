/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {Server} from '../redux/modules/servers';
import {patcher, Channel, ChannelStatus} from '../api/patcherAPI';
import {CSENormalizeString} from '../api/CSENormalizeString';
import {restAPI} from 'camelot-unchained';

import EualaModal from './EualaModal';
import CommandLineArgsModal from './CommandLineArgsModal';
import Animate from '../Animate';

export class Progress {
  constructor(public rate: number = 0, public dataCompleted: number = 0, public totalDataSize: number = 0) {}
  
  public timeEstimate = () => {
    return Progress.secondsToString((this.remaining() * 8) / this.rate);
  }
  
  public remaining = () => {
    return this.totalDataSize - this.dataCompleted;
  }
  
  static bytesToString(bytes: number): string {
    if (bytes >= 1099511627776) {
      // display as TB
      return (bytes / 1099511627776).toFixed(2) + 'TB';
    } else if (bytes >= 1073741824) {
      // display as GB
      return (bytes / 1073741824).toFixed(2) + 'GB';
    } else if (bytes >= 1048576) {
      // display as MB
      return (bytes / 1048576).toFixed(2) + 'MB';
    } else {
      // display rest as KB
      return (bytes / 1024).toFixed(2) + 'KB';
    }
  }
  
  static bypsToString(bytes: number): string {
    if (bytes >= 1000000000) {
      // display as GB
      return (bytes / 1000000000).toFixed(2) + 'GB/s';
    } else if (bytes >= 1000000) {
      // display as MB
      return (bytes / 1000000).toFixed(2) + 'MB/s';
    } else {
      // display rest as KB
      return (bytes / 1000).toFixed(2) + 'KB/s';
    }
  }
  
  static secondsToString(val: number): string {
    let days = Math.floor(val / 86400)
    let hours = Math.floor((val % 86400) / 3600);
    let minutes = Math.floor((val % 3600) / 60);
    let seconds = Math.floor(val % 60);
    return (days > 0 ? days + 'd ' : '')
      + (hours > 0 ? hours + 'h ' : '')
      + (minutes < 10 ? '0' + minutes + 'm ' : minutes + 'm ')
      + (seconds < 10 ? '0' + seconds + 's ' : seconds + 's ');
  }
}

export interface PatchButtonProps {
  server: Server;
  channel: Channel;
  playLaunch: () => void;
  playPatchComplete: () => void;
  playSelect: () => void;
  character: restAPI.SimpleCharacter
};

export interface PatchButtonState {
  showEuala: boolean;
};

class PatchButton extends React.Component<PatchButtonProps, PatchButtonState> {
  public name: string = 'cse-patcher-patch-button';
  private intervalHandle: any;
  
  constructor(props: PatchButtonProps) {
    super(props);
    this.state = { showEuala: false}
  }
  
  onClicked = () => {
    switch (this.props.channel.channelStatus) {
      case ChannelStatus.NotInstalled: this.install();
      case ChannelStatus.Validating: break;
      case ChannelStatus.Updating: break;
      case ChannelStatus.OutOfDate: this.install();
      case ChannelStatus.Ready: this.playNow();
      case ChannelStatus.Launching: break;
      case ChannelStatus.Running: break;
      case ChannelStatus.Uninstalling: break;
      case ChannelStatus.UpdateFailed: this.install();
    }
  }
  
  playNow = () => {
    this.setState({showEuala: true});
  }
  
  closeEualaModal = () => {
    this.setState({showEuala: false});
  }
  
  closeArgsModal = () => {
    this.setState({showEuala: false});
  }
  
  launchClient = (commands: string = '') => {
    this.setState({showEuala: false});
    let launchString = commands;
    if (this.props.character && this.props.character.id !== '') {
      launchString = `server=${this.props.server.host} autoconnect=1 character=${CSENormalizeString(this.props.character.name)} ${commands}`
    }
    patcher.launchChannelfunction(this.props.channel, launchString);
    this.props.playLaunch();
  }
  
  install = () => {
    patcher.installChannel(this.props.channel);
    this.props.playSelect();
  }
  
  uninstall = () => {
    patcher.uninstallChannel(this.props.channel);
    this.props.playSelect();
  }
  
  generateEualaModal = () => {
    return (
      <div className='fullscreen-blackout flex-row' key='accept-euala'>
        <EualaModal accept={this.launchClient} decline={this.closeEualaModal} />
      </div>
    );
  }
  
  generateArgsModal = () => {
    return (
      <div className='fullscreen-blackout flex-row' key='accept-euala'>
        <CommandLineArgsModal ok={this.launchClient} cancel={this.closeEualaModal} />
      </div>
    );
  }
  
  render() {
    let uninstall: any = null;
    let layer1: any = null;
    let layer2: any = null;
    let layer3: any = null;
    switch(this.props.channel.channelStatus) {
      case ChannelStatus.NotInstalled:
        layer1 = <a className='waves-effect btn install-download-btn uninstalled' onClick={this.onClicked}>Install</a>;
        break;
      case ChannelStatus.Validating: 
        layer1 = <a className='waves-effect btn install-download-btn installing'>Validating</a>;
        break;
      case ChannelStatus.Updating:
        layer1 = <a className='waves-effect btn install-download-btn installing'>Installing</a>;
        
        let percentRemaining = 100.0 - ((patcher.getDownloadRemaining() / patcher.getDownloadEstimate()) * 100);
        layer2 = <div className='fill' style={{width: percentRemaining + '%', opacity: 1}} />;
        
        let rate = Progress.bypsToString(patcher.getDownloadRate());
        let dataSize = Progress.bytesToString(patcher.getDownloadEstimate() - patcher.getDownloadRemaining()) + '/' + Progress.bytesToString(patcher.getDownloadEstimate());
        let time = Progress.secondsToString(patcher.getDownloadRemaining() / patcher.getDownloadRate());
        layer3 = (
          <div className='text'>
            <div className='progress-text'><span className='body'>{time}</span></div>
            <div className='progress-text'><span className='body'>{rate}</span></div>
            <div className='progress-text'><span className='body'>{dataSize}</span></div>
          </div>
        );
        break;
      case ChannelStatus.OutOfDate:
        layer1 = <a className='waves-effect btn install-download-btn uninstalled' onClick={this.onClicked}>Update</a>;
        break;
      case ChannelStatus.Ready:
        layer1 = <a className='waves-effect btn install-download-btn ready' onClick={this.onClicked}>Play Now</a>;
        uninstall = <a className='uninstall-link' onClick={this.uninstall}>Uninstall {this.props.channel.channelName}</a>;
        break;
      case ChannelStatus.Launching:
        layer1 = <a className='waves-effect btn install-download-btn installing'>Launching</a>;
        break;
      case ChannelStatus.Running:
        layer1 = <a className='waves-effect btn install-download-btn installing'>Playing</a>;
        break;
      case ChannelStatus.Uninstalling:
        layer1 = <a className='waves-effect btn install-download-btn installing'>Uninstalling</a>;
        break;
      case ChannelStatus.UpdateFailed:
        layer1 = <a className='waves-effect btn install-download-btn uninstalled' onClick={this.onClicked}>Update Failed. Try Again.</a>;
        break;
    }
    
    // euala modal
    let eualaModal: any = this.state.showEuala ? this.generateEualaModal() : null;
    
    return (
      <div>
        <div id={this.name}>
          <div className='layer z1'>
            {layer1}
          </div>
          <div className='layer z2'>
            {layer2}
          </div>
          <div className='layer z3'>
            {layer3}
          </div>
        </div>
        {uninstall}
        <Animate animationEnter='slideInUp' animationLeave='slideOutDown'
          durationEnter={400} durationLeave={500}>
          {eualaModal}
        </Animate>
      </div>
    );
  }
}

export default PatchButton;

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {patcher, Channel, ChannelStatus} from '../api/patcherAPI';

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
  
  static bitsToString(bits: number): string {
    if (bits >= 1000000000) {
      // display as GB
      return (bits / 1000000000).toFixed(2) + 'Gbps';
    } else if (bits >= 1000000) {
      // display as MB
      return (bits / 1000000).toFixed(2) + 'Mbps';
    } else {
      // display rest as KB
      return (bits / 1000).toFixed(2) + 'Kbps';
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
  channel: Channel;
  playLaunch: () => void;
  playPatchComplete: () => void;
  playSelect: () => void;
};

export interface PatchButtonState {
};

class PatchButton extends React.Component<PatchButtonProps, PatchButtonState> {
  public name: string = 'cse-patcher-patch-button';
  private intervalHandle: any;
  
  constructor(props: PatchButtonProps) {
    super(props);
  }
  
  onClicked = () => {
    switch (this.props.channel.channelStatus) {
      case ChannelStatus.Install: this.install();
      case ChannelStatus.Validating: break;
      case ChannelStatus.Installing: break;
      case ChannelStatus.UpdateQueued: break;
      case ChannelStatus.Ready: this.playNow();
      case ChannelStatus.UninstallQueued: break;
    }
  }
  
  playNow = () => {
    patcher.launchChannelfunction(this.props.channel, '');
    this.props.playLaunch();
  }
  
  install = () => {
    patcher.installChannel(this.props.channel);
    this.props.playSelect();
  }
  
  render() {
    let layer1: any = null;
    let layer2: any = null;
    let layer3: any = null;
    switch(this.props.channel.channelStatus) {
      case ChannelStatus.Install:
        layer1 = <a className='waves-effect btn install-download-btn uninstalled' onClick={this.onClicked}>Install</a>;
        break;
      case ChannelStatus.Validating: 
        layer1 = <a className='waves-effect btn install-download-btn installing'>Validating</a>;
        break;
      case ChannelStatus.Installing:
        layer1 = <a className='waves-effect btn install-download-btn installing'>Installing</a>;
        
        let percentRemaining = (patcher.getDownloadEstimate() - (patcher.getDownloadRemaining() / patcher.getDownloadEstimate())) * 100;
        layer2 = <div className='fill' style={{width: percentRemaining + '%', opacity: 1}} />;
        
        let rate = Progress.bitsToString(patcher.getDownloadRate());
        let dataSize = Progress.bytesToString(patcher.getDownloadEstimate() - patcher.getDownloadRemaining()) + '/' + Progress.bytesToString(patcher.getDownloadEstimate());
        let time = Progress.secondsToString((patcher.getDownloadRemaining() * 8) / patcher.getDownloadRate());
        layer3 = (
          <div className='text'>
            <div className='progress-text'><span className='body'>{time}</span></div>
            <div className='progress-text'><span className='body'>{rate}</span></div>
            <div className='progress-text'><span className='body'>{dataSize}</span></div>
          </div>
        );
        break;
      case ChannelStatus.UpdateQueued:
       layer1 = <a className='waves-effect btn install-download-btn ready'>Update Queued</a>;
        break;
      case ChannelStatus.Ready:
        layer1 = <a className='waves-effect btn install-download-btn ready' onClick={this.onClicked}>Play Now</a>;
        break;
      case ChannelStatus.UninstallQueued:
        layer1 = <a className='waves-effect btn install-download-btn installing'>Uninstall Queued</a>;
        break;
    }
    
    
    return (
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
    );
  }
}

export default PatchButton;

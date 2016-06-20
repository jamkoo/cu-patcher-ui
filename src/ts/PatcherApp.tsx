/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import * as ReactDom from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import {connect, Provider} from 'react-redux';
import * as thunkMiddleware from 'redux-thunk';

import reducer from './redux/modules/reducer';
import {changeRoute, Routes} from './redux/modules/locations';
import {showChat, hideChat} from './redux/modules/chat';
import {fetchPage} from './redux/modules/news';
import {fetchAlerts, validateAlerts} from './redux/modules/patcherAlerts';
import {fetchHeroContent, validateHeroContent} from './redux/modules/heroContent';
import {changeChannel, requestChannels} from './redux/modules/channels';
import {muteSounds, unMuteSounds} from './redux/modules/sounds';
import {muteMusic, unMuteMusic} from './redux/modules/music';
import {fetchServers, changeServer} from './redux/modules/servers';
import {fetchCharacters, selectCharacter} from './redux/modules/characters';

import Sidebar from './sidebar/Sidebar';
import Header from './Header';
import WindowHeader from './WindowHeader';
import Chat from './content/chat/Chat';
import Hero from './content/Hero';
import News from './content/News';
import PatchNotes from './content/PatchNotes';
import Support from './content/Support';
import Animate from './Animate';

import {patcher, Channel} from './api/PatcherAPI';
import {CSENormalizeString} from './api/CSENormalizeString';


const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware
)(createStore);
let store = createStoreWithMiddleware(reducer);

function select(state: any): any {
  return {
    location: state.location.location,
    chat: state.chat,
    currentChannel: state.channels.currentChannel,
    channels: state.channels.channels,
    news: state.news,
    alerts: state.alerts,
    heroContent: state.heroContent,
    soundMuted: state.soundMuted,
    musicMuted: state.musicMuted,
    servers: state.servers,
    characters: state.characters,
  }
}

// since we're using redux all props are optional in the TypeScript interface
// since redux fills it out at runtime rather than props being passed in from
// a parent component
//
// Props will match what is returned from select() plust a dispatch function
export interface PatcherAppProps {
  dispatch?: (action: any) => void;
  location?: Routes;
  chat?: any;
  currentChannel?: number;
  channels?: any;
  news?: any;
  alerts?: any;
  heroContent?: any;
  soundMuted?: boolean;
  musicMuted?: boolean;
  servers?: any;
  characters?: any;
}

export interface PatcherState {};

export class PatcherApp extends React.Component<PatcherAppProps, PatcherState> {
  public name = 'cse-patcher';
  private playOnce = false;
  private heroContentInterval: any = null;

  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    location: React.PropTypes.number.isRequired,
    chat: React.PropTypes.object.isRequired
  }

  onRouteChanged = (route: Routes) => {
    this.props.dispatch(changeRoute(route));
    this.playSelect();
  }

  hideChat = () => {
    this.props.dispatch(hideChat());
  }

  showChat = () => {
    this.props.dispatch(showChat());
  }

  fetchNewsPage = (page: number) => {
    this.props.dispatch(fetchPage(page));
  }

  onPatcherAPIUpdate = () => {
    this.setState({});
  }

  onMuteSounds = () =>  {
    this.props.dispatch(muteSounds());
  }

  onUnMuteSounds = () => {
    this.props.dispatch(unMuteSounds());
  }

  onMuteMusic = () =>  {
    this.props.dispatch(muteMusic());
  }

  onUnMuteMusic = () => {
    this.props.dispatch(unMuteMusic());
  }

  play = (name: string, volume: number = 0.75) => {
    const sound: HTMLAudioElement = (this.refs['sound-'+name] as HTMLAudioElement);
    if (sound && !this.props.soundMuted) {
      sound.play();
      sound.volume = volume;
    }
  }

  playSelect = () => {
    this.play('select');
  }

  onLogIn = () => {
    setTimeout(() => this.setState({}), 500);
  }

  componentDidUpdate() {
    if (this.props.musicMuted && !(this.refs['sound-bg'] as HTMLAudioElement).paused) {
      console.log('pausing bg');
      (this.refs['sound-bg'] as HTMLAudioElement).pause();
    } else if (!this.props.musicMuted && (this.refs['sound-bg'] as HTMLAudioElement).paused && !this.playOnce) {
      console.log('playing bg');
      (this.refs['sound-bg'] as HTMLAudioElement).play();
      (this.refs['sound-bg'] as HTMLAudioElement).volume = 0.5;
    }
  }

  componentDidMount() {
    // fetch initial hero content and then every 30 minutes validate & fetch hero content.
    if (!this.props.heroContent.isFetching) this.props.dispatch(fetchHeroContent());
    this.heroContentInterval = setInterval(() => {
      this.props.dispatch(validateHeroContent());
      if (!this.props.heroContent.isFetching) this.props.dispatch(fetchHeroContent());
    }, 60000 * 30);

    if (!this.props.musicMuted) {
      (this.refs['sound-bg'] as HTMLAudioElement).play();
    }
    (this.refs['sound-bg'] as HTMLAudioElement).onended = () => this.playOnce = true;
  }

  componentDidUnMount() {
    // unregister intervals
    clearInterval(this.heroContentInterval);
  }

  render() {
    let content: any = null;
    switch(this.props.location) {
      case Routes.HERO:
        content = (
          <div key='0'>
            <Hero
              isFetching={this.props.heroContent.isFetching}
              didInvalidate={this.props.heroContent.didInvalidate}
              lastUpdated={this.props.heroContent.lastUpdated}
              items={this.props.heroContent.items} />
          </div>
        );
        break;
      case Routes.NEWS:
        content = (
          <div key='1'>
            <News
              isFetching={this.props.news.isFetching}
              didInvalidate={this.props.news.didInvalidate}
              lastUpdated={this.props.news.lastUpdated}
              nextPage={this.props.news.nextPage}
              posts={this.props.news.posts}
              fetchPage={this.fetchNewsPage}/>
          </div>
        );
        break;
      case Routes.PATCHNOTES: content = <div key='2'><PatchNotes /></div>; break;
      case Routes.SUPPORT: content = <div key='3'><Support /></div>; break;
    }

    let chat: any = null;
    if (this.props.chat.visibility.showChat) {
      chat = (
        <div id="chat-window" key='0'>
          <Chat hideChat={this.hideChat} username={CSENormalizeString(patcher.getScreenName())} userpass={patcher.getUserPass()} />
        </div>
      );
    }

    return (
      <div id={this.name}>
        <WindowHeader soundMuted={this.props.soundMuted}
          onMuteSounds={() => this.props.soundMuted ? this.onUnMuteSounds() : this.onMuteSounds()}
          musicMuted={this.props.musicMuted}
          onMuteMusic={() => this.props.musicMuted ? this.onUnMuteMusic() : this.onMuteMusic()}/>
        <Header changeRoute={this.onRouteChanged} activeRoute={this.props.location} openChat={this.showChat} />
        <Provider store={store}>
          <Sidebar onLogIn={this.onLogIn} />
        </Provider>
        <div className='main-content'>
        <Animate animationEnter='fadeIn' animationLeave='fadeOut'
          durationEnter={400} durationLeave={500}>
          {content}
        </Animate>
        </div>
        <Animate animationEnter='slideInRight' animationLeave='slideOutRight'
          durationEnter={400} durationLeave={500}>
          {chat}
        </Animate>
        // Audio
        <audio src='sounds/select.ogg' ref='sound-select' />
        <audio src='sounds/launch-game.ogg' ref='sound-launch-game' />
        <audio src='sounds/patch-complete.ogg' ref='sound-patch-complete' />
        <audio src='sounds/patcher-theme-v0.1.ogg' ref='sound-bg' />
      </div>
    );
  }
};

export default connect(select)(PatcherApp);

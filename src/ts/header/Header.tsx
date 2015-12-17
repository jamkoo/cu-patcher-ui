/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import * as events from '../core/events';

export enum HeaderRoute {
  Main,
  PatchNotes,
  News,
  Support,
  Chat
};

export class HeaderProps {
  public changeRoute : (header: HeaderRoute) => void;
};

export class Header extends React.Component<HeaderProps, any> {
  public name = 'Header';

  constructor(props: HeaderProps) {
    super(props);

    this.internalLink = this.internalLink.bind(this);
    this.externalLink = this.externalLink.bind(this);
    this.showChat = this.showChat.bind(this);
  }

  internalLink(e: any) {
    this.props.changeRoute(e.target.dataset.route);
  }

  externalLink(e: any) {
    window.open(e.target.dataset.href, '_blank');
  }

  showChat() {
    events.fire('show-chat', {});
  }

  render() {
    return (
      <div id={this.name} className='glass'>
        <div className="nav-wrap">
          <ul className="nav">
            <li className="nav-item" onClick={this.internalLink} data-route={HeaderRoute.Main}>Camelot Unchained</li>
            <li className="nav-item" onClick={this.internalLink} data-route={HeaderRoute.PatchNotes}>Patch Notes</li>
            <li className="nav-item" onClick={this.internalLink} data-route={HeaderRoute.News}>News</li>
            <li className="nav-item" onClick={this.internalLink} data-route={HeaderRoute.Support}>Support</li>
            <li className="nav-item" onClick={this.externalLink} data-href='http://camelotunchained.com/v2/'>Getting Started <i className="tiny material-icons">open_in_new</i></li>
            <li className="nav-item" onClick={this.externalLink} data-href='http://camelotunchained.com/v2/'>CSE Store <i className="tiny material-icons">open_in_new</i></li>
            <li className="nav-item" onClick={this.showChat}>Chat</li>
          </ul>
        </div>
      </div>
    );
  }
};

export default Header;

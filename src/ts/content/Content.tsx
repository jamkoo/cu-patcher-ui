/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import {HeaderRoute} from '../header/Header';
import Hero from './main/Hero';
import News from './news/News';
import PatchNotes from './patchNotes/PatchNotes';
import Support from './support/Support';

export class ContentProps {
  public route: string;
};

export class Content extends React.Component<ContentProps, any> {
  public name = 'Content';
  public content: any;

  constructor(props: ContentProps) {
    super(props);
  }

  render() {
    switch(parseInt(this.props.route) as HeaderRoute) {
      case HeaderRoute.Main: this.content = <Hero />; break;
      case HeaderRoute.News: this.content = <News />; break;
      case HeaderRoute.PatchNotes: this.content = <PatchNotes />; break;
      case HeaderRoute.Support: this.content = <Support />; break;
      case HeaderRoute.Chat: // slide over chat
    }

    return (
      <div id={this.name}>
        {this.content}
      </div>
    );
  }
};

export default Content;
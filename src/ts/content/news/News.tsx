/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';

export class NewsProps {
};

export class NewsState {
}

export class News extends React.Component<NewsProps, NewsState> {
  public name = 'News';

  constructor(props: NewsProps) {
    super(props);
  }

  render() {
    return (
      <div id={this.name}>
        <h2>{this.name}</h2>
        <p>content</p>
      </div>
    );
  }
};

export default News;

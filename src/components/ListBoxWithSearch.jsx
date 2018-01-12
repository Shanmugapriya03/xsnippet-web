import React from 'react';

import ListBox from './ListBox';
import { regExpEscape } from '../helpers';

class ListBoxWithSearch extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
    };
    this.onSearch = this.onSearch.bind(this);
  }

  onSearch(e) {
    this.setState({ searchQuery: e.target.value.trim() });
  }

  render() {
    const { searchQuery } = this.state;
    let { items } = this.props;

    // Filter out only those items that match search query. If no query is
    // set, do nothing and use the entire set.
    if (searchQuery) {
      const regExp = new RegExp(regExpEscape(searchQuery), 'gi');
      items = items.filter(item => item.match(regExp));
    }

    return (
      [
        <div className="new-snippet-lang-header" key="Syntax input">
          <input className="input" placeholder="Type to search..." onChange={this.onSearch} />
        </div>,
        <div className="new-snippet-lang-list-wrapper" key="Syntax list">
          <ListBox
            items={items}
            onClick={this.props.onClick}
          />
        </div>,
      ]
    );
  }
}

export default ListBoxWithSearch;
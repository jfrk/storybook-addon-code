import React from 'react';
import { STORY_CHANGED } from '@storybook/core-events';
import addons from '@storybook/addons';
import Prism from 'prismjs';

class Code extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {code: ''};
    this.channelName = `soft/code/add_${props.type}`;
    this.onSelectTab = this.onSelectTab.bind(this);
  }

  onStoryChange = () => {
    this.onSelectTab('');
  }

  onSelectTab({code, type}) {
    const formattedCode = type && code && Prism.highlight(code, Prism.languages[type]);

    this.setState({code: formattedCode});
  }

  componentDidMount() {
    const { channel, api } = this.props;
    channel.on(this.channelName, this.onSelectTab);

    api.on(STORY_CHANGED, this.onStoryChange);
  }

  render() {
    const { code } = this.state;
    const { type, active } = this.props;
    return (
      active ?
      <div>{
        code ?
          <pre className={`language-${type}`}>
            <code>
              <div dangerouslySetInnerHTML={{__html: code}} />
            </code>
          </pre> :
          <p> No {type} code Found </p>
        }
      </div> :
      null
    );
  }

  componentWillUnmount() {
    api.off(STORY_CHANGED, this.onStoryChange);

    this.unmounted = true;
    const { channel, api } = this.props;
    channel.removeListener(this.channelName, this.onSelectTab);
  }
}

const registerTab  = ({label, type}) => {
  import(`prismjs/components/prism-${type}.js`);
  addons.register(`soft/code/add_${type}`, (api) => {
    addons.addPanel(`soft/${type}/panel`, {
      title: label,
      render: ({active, key}) => (
        <Code
          active={active}
          api={api}
          channel={addons.getChannel()}
          key={key}
          type={type}
        />
      )
    })
  })
}

export const configure = ({theme = 'prism', tabs = []}) => {
  import(`prismjs/themes/${theme}.css`);
  const tabsToRender = [].concat(tabs);
  tabsToRender.forEach((t) => registerTab(t));
}
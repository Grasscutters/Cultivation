import React from 'react'
import Tr from '../../../utils/language'

import './NewsSection.css'

interface IProps {
  selected?: string;
}

interface IState {
  selected: string;
}

export default class NewsSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      selected: props.selected || 'commits'
    }

    this.setSelected = this.setSelected.bind(this)
  }

  setSelected(item: string) {
    this.setState({ selected: item })
  }

  render() {
    return (
      <div className="NewsSection">
        <div className="NewsTabs">
          <div className={'NewsTab ' + (this.state.selected === 'commits' ? 'selected' : '')} id="commits" onClick={() => this.setSelected('commits')}>
            <Tr text="news.latest_commits" />
          </div>
        </div>
        <div className="NewsTabs">
          <div className={'NewsTab ' + (this.state.selected === 'latest_version' ? 'selected' : '')} id="latest_version" onClick={() => this.setSelected('latest_version')}>
            <Tr text="news.latest_version" />
          </div>
        </div>
      </div>
    )
  }
}
import React from 'react'

import './Notification.css'

interface IProps {
  children: React.ReactNode | null
  show: boolean
}

export default class Notification extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return (
      <div className={'Notification ' + (this.props.show ? 'NotifShow' : '')}>
        <div className="NotificationMessage">{this.props.children}</div>
      </div>
    )
  }
}

import React from 'react'

import Close from '../../resources/icons/close.svg'
import './MiniDialog.css'

interface IProps {
  children: React.ReactNode[] | React.ReactNode;
  title?: string;
  closeable?: boolean;
  closeFn: () => void;
}

export default class MiniDialog extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.props.closeFn)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.props.closeFn)
  }

  render() {
    return (
      <div className="MiniDialog">
        {
          this.props.closeable !== undefined && this.props.closeable ?
            <div className="MiniDialogTop" onClick={this.props.closeFn}>
              <span>{this.props?.title}</span>
              <img src={Close} className="MiniDialogClose" />
            </div> : null
        }

        <div className="MiniDialogInner">
          {this.props.children}
        </div>
      </div>
    )
  }
}
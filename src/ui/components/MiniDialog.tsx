import React from 'react'

import Close from '../../resources/icons/close.svg'
import './MiniDialog.css'

interface IProps {
  children: React.ReactNode[] | React.ReactNode
  title?: string
  closeable?: boolean
  closeFn: () => void
}

export default class MiniDialog extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  componentDidMount() {
    document.addEventListener('mousedown', (evt) => {
      const tgt = evt.target as HTMLElement
      const isInside = tgt.closest('.miniDialog') !== null

      if (!isInside) {
        this.props.closeFn()
      }
    })
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.props.closeFn)
  }

  render() {
    return (
      <div className="MiniDialog" id="miniDialogContainer">
        {this.props.closeable !== undefined && this.props.closeable ? (
          <div className="MiniDialogTop" id="miniDialogContainerTop" onClick={this.props.closeFn}>
            <span>{this.props?.title}</span>
            <img src={Close} className="MiniDialogClose" id="miniDialogButtonClose" />
          </div>
        ) : null}

        <div className="MiniDialogInner" id="miniDialogContent">
          {this.props.children}
        </div>
      </div>
    )
  }
}

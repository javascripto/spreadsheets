import 'canvas-datagrid'
import React from 'react';
import ReactDOM from 'react-dom'

interface Props {
  data: unknown[]
  width?: string
  height?: string
}

export class CanvasDataGrid extends React.Component<Props> {
  grid: any;
  ref: any
  constructor(props: any) {
    super(props)
    this.ref = React.createRef()
  }
  updateAttributes(nextProps?: any) {
    Object.keys(this.props).forEach(key => {
      if (!nextProps || this.props[key as keyof Props] !== nextProps[key]) {
        if (this.grid.attributes[key] !== undefined) {
          this.grid.attributes[key] = nextProps ? nextProps[key] : this.props[key as keyof Props];
        } else {
          this.grid[key] = nextProps ? nextProps[key] : this.props[key as keyof Props];
        }
      }
    });
  }
  componentDidUpdate(nextProps: any) {
    this.updateAttributes(nextProps);
  }
  shouldComponentUpdate() {
    return false;
  }
  componentWillUnmount() {
    this.grid.dispose();
  }
  componentDidMount() {
    this.grid = ReactDOM.findDOMNode(this);
    this.updateAttributes();

    this.ref.current.style = {
      ...({ width: this.props.width }),
      ...({ height: this.props.height }),
    }
  }
  render() {
    return React.createElement('canvas-datagrid', { ref: this.ref });
  }
}

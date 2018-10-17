import React, { Component } from 'react';

class Canvas extends Component {
  constructor(props) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUpOrLeave = this.onMouseUpOrLeave.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    this.state = {
      color: 'black',
    }
    this.colors = [
      'red',
      'orange',
      'yellow',
      'green',
      'cyan',
      'blue',
      'purple',
      'brown',
      'black',
      'silver',
      'white'
    ];
    this.isDrawing = false;
    this.points = [];
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');

    if (window.innerWidth < 992) {
      const width = Math.min(document.documentElement.clientWidth, window.innerWidth);
      this.ctx.canvas.width = 0.9 * width;
      this.ctx.canvas.height = this.ctx.canvas.width / 1.333333;
    } else {
      this.ctx.canvas.width = 600;
      this.ctx.canvas.height = 450;
    }

    this.ctx.lineWidth = 6;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height);

    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
    if (window.innerWidth < 992) {
      const width = Math.min(document.documentElement.clientWidth, window.innerWidth);
      this.ctx.canvas.width = 0.9 * width;
      this.ctx.canvas.height = this.ctx.canvas.width / 1.333333;
      this.redraw();
    } else {
      this.ctx.canvas.width = 600;
      this.ctx.canvas.height = 450;
      this.redraw();
    }
  }

  onMouseDown({ nativeEvent }) {
    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();
    let { offsetX, offsetY } = nativeEvent;
    if (nativeEvent.touches) {
      offsetX = nativeEvent.touches[0].pageX - nativeEvent.touches[0].target.offsetLeft;     
      offsetY = nativeEvent.touches[0].pageY - nativeEvent.touches[0].target.offsetTop - 91;
    }
    this.isDrawing = true;
    this.points.push({ x: offsetX+2, y: offsetY+2, drag: false, color: this.state.color, size: this.ctx.lineWidth });
    this.redraw();
  }

  onMouseMove({ nativeEvent }) {
    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();
    if (this.isDrawing) {
      let { offsetX, offsetY } = nativeEvent;
      if (nativeEvent.touches) {
        offsetX = nativeEvent.touches[0].pageX - nativeEvent.touches[0].target.offsetLeft;     
        offsetY = nativeEvent.touches[0].pageY - nativeEvent.touches[0].target.offsetTop - 91;
      }
      this.points.push({ x: offsetX+2, y: offsetY+2, drag: true, color: this.state.color, size: this.ctx.lineWidth });
      this.redraw();
    }
  }

  onMouseUpOrLeave(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.isDrawing = false;
  }

  redraw() {
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
    for(let i=0; i<this.points.length; i++) {		
      this.ctx.beginPath();
      if (this.points[i].drag) {
        this.ctx.moveTo(this.points[i-1].x, this.points[i-1].y);
      } else {
        this.ctx.moveTo(this.points[i].x-1, this.points[i].y);
      }
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
      this.ctx.closePath();
      this.ctx.strokeStyle = this.points[i].color;
      this.ctx.lineWidth = this.points[i].size;
      this.ctx.stroke();
    }
  }

  reset() {
    this.points = [];
    this.redraw();
  }

  render() {
    return (
      <div className="canvas-wrapper">
        <canvas 
          className="canvas"
          ref={(node) => { this.canvas = node }}
          width={600}
          height={450}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUpOrLeave}
          onMouseLeave={this.onMouseUpOrLeave}
          onTouchStart={this.onMouseDown}
          onTouchMove={this.onMouseMove}
          onTouchEnd={this.onMouseUpOrLeave}
        />
        <div className="options">
          <input ref={(node) => { this.sizeSlider = node }} className="size-slider" type="range" min="2" max="40" defaultValue="6" step="2" onChange={ev => { this.ctx.lineWidth = ev.target.value }} />
          <div className="colors">
            {this.colors.map((color, index) => {
              return (
                <div key={index} className={this.state.color === color ? `color-option ${color} selected` : `color-option ${color}`} onClick={() => { this.setState({ color }) }}></div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Canvas;

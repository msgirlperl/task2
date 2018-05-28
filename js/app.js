Number.prototype.between = function (a, b) {
  return ((this >= a) && (this <= b));
};

({
  initDone: false,
  canvas: null,
  lines: [],
  pos: null,
  modeEnum: {
    DRAW: 1,
    ERASE: 2,
    SELECT: 3,
    PENCIL: 4,
    MOVE: 5
  },
  canvasMode: null,
  selectedLineIndex: null,

  init: function () {
    if(this.initDone)
      return;
    this.canvas = document.getElementById('canvas');
    this.canvasMode = this.modeEnum.DRAW;
    this.bindToolbarEvents();
    this.bindDrawAreaEvents();
    this.initDone = true;
  },

  /**
   * Registers event handlers for toolbar buttons
   */
  bindToolbarEvents: function () {
    document.getElementById('btn-line').addEventListener('click', () => {
      this.canvasMode = this.modeEnum.DRAW;
      this.unSelectLines();
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-erase').addEventListener('click', () => {
      if (this.canvasMode === this.modeEnum.SELECT && this.selectedLineIndex > -1) {
        this.lines.splice(this.selectedLineIndex, 1);
        this.selectedLineIndex = -1;
        this.render();
      } else {
        this.canvasMode = this.modeEnum.ERASE;
        this.updateToolbarState();
      }
      this.pos = null;
    });
    document.getElementById('btn-select').addEventListener('click', () => {
      this.canvasMode = this.modeEnum.SELECT;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-pencil').addEventListener('click', () => {
      this.canvasMode = this.modeEnum.PENCIL;
      this.pos = null;
      this.unSelectLines();
      this.updateToolbarState();
    });
    document.getElementById('btn-move').addEventListener('click', () => {
      this.canvasMode = this.modeEnum.MOVE;
      this.unSelectLines();
      this.pos = null;
      this.updateToolbarState();
    });
  },

  /**
   * Removes any selected lines and re-draws the canvas
   */
  unSelectLines: function () {
    if (this.selectedLineIndex > -1){
      this.selectedLineIndex = -1;
      this.render();
    }
  },

  isEraseMode: function () {
    return this.canvasMode === this.modeEnum.ERASE;
  },
  isDrawMode: function () {
    return this.canvasMode === this.modeEnum.DRAW;
  },
  isSelectMode: function () {
    return this.canvasMode === this.modeEnum.SELECT;
  },
  isPencilMode: function () {
    return this.canvasMode === this.modeEnum.PENCIL;
  },
  isMoveMode: function () {
    return this.canvasMode === this.modeEnum.MOVE;
  },

  /**
   * Sets active tab indicator in the toolbar
   */
  updateToolbarState: function () {
    document.getElementById('btn-erase').className = this.isEraseMode() ? 'active' : '';
    document.getElementById('btn-line').className = this.isDrawMode() ? 'active' : '';
    document.getElementById('btn-select').className = this.isSelectMode() ? 'active' : '';
    document.getElementById('btn-pencil').className = this.isPencilMode() ? 'active' : '';
    document.getElementById('btn-move').className = this.isMoveMode() ? 'active' : '';
  },

  /**
   * Registers event handlers for events on the canvas
   */
  bindDrawAreaEvents: function () {
    this.canvas.addEventListener('click', (e) => {
      let x = e.offsetX, y = e.offsetY;
      if (this.isEraseMode()) {
        this.eraseLine(x,y);
      } else if (this.isDrawMode()) {
          this.drawLine(x,y);
      } else if (this.isSelectMode()) {
          this.selectLine(x,y);
      }
      this.render();
    });

    canvas.addEventListener('mousedown', (e) => {
      if (this.isPencilMode() && e.which === 1){
        this.handlePencilModeMouseDown(e);
      } else if (this.isMoveMode() && e.which === 1){
          this.handleMoveModeMouseDown(e);
      }
    });
  },

  handlePencilModeMouseDown: function(e) {
    this.pos = [ e.offsetX, e.offsetY ];
    let objectLines = []; // will hold the lines created while dragging the mouse
    this.lines.push(objectLines);

    // creates new Line from last position and adds it to the current line Array, then re-draws the canvas
    const mouseMoveHandler = (evt) => {
      let newX = evt.offsetX, newY = evt.offsetY;
      // verify the mouse didn't leave the canvas
      if (newX.between(0, this.canvas.width) && newY.between(0, this.canvas.height)) {
        let line = new Line(this.pos[0], this.pos[1], newX, newY);
        objectLines.push(line);
        this.render();
        this.pos = [ newX, newY ];
      }
    };
    canvas.addEventListener('mousemove', mouseMoveHandler);

    // ends the drawing by un-registering the mousemove handler (and then unregisters itself)
    const mouseUpHandler = () => {
      this.pos = null;
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    document.addEventListener('mouseup', mouseUpHandler);
  },

  handleMoveModeMouseDown: function(e) {
    this.pos = [ e.offsetX, e.offsetY ];
    this.selectLine(e.offsetX, e.offsetY);
    if (this.selectedLineIndex > -1){
      /**
       *  Calculates how far the line Array (the drawn object) is projected to move and determines if it will remain within the canvas.
       *  If so, moves the Array, and re-draws the canvas.
       *  If not, it briefly shows a warning in the toolbar and removes the handlers to re-set the move.
       */
      const mouseMoveHandler = (evt) => {
        let moveX = evt.offsetX - this.pos[0];
        let moveY = evt.offsetY - this.pos[1];
        let selectedLines = this.lines[this.selectedLineIndex];
        if (selectedLines.some(line => line.checkDisallowMove(moveX, moveY, canvas))){ // verify we'll still be on the canvas
          let warning = document.getElementById('warning');
          warning.className = "visible";
          setTimeout(() =>  warning.className = "hidden", 3000);
        } else {
          selectedLines.map(line => line.move(moveX, moveY));
          this.render();
          this.pos = [ evt.offsetX, evt.offsetY ];
        }
      };
      canvas.addEventListener('mousemove', mouseMoveHandler);
      // ends the move by un-registering the mousemove handler (and then unregisters itself)
      const mouseUpHandler = () => {
        this.pos = null;
        canvas.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };
      document.addEventListener('mouseup', mouseUpHandler);
    }
  },

  /**
   * Finds the index in the list of line Arrays that corresponds to the Array with the line closest to (x,y).
   * If none is found, -1 is returned.
   */
  findClosestIndex: function(x,y) {
    if (this.lines.length > 0) { // if there's something to select
      let minSquareDistance, closestIndex;
      this.lines.forEach((objectLines, index) => {
        objectLines.forEach((line) => {
          let squareDistance = line.squareDistanceFrom(x, y); // don't need to know the actual distance so let's use the square as a short-cut
          if((minSquareDistance === undefined) || (squareDistance < minSquareDistance)) {
            minSquareDistance = squareDistance;
            closestIndex = index;
          }
        });
      });
      return closestIndex;
    }
    return -1;
  },

  /**
   * Finds the index in the list of line Arrays that corresponds to the Array with the line closest to (x,y).
   * If it's within 10 pixels of (x,y), its index is stored as the "selectedLineIndex"; if not, "selectedLineIndex" is set to -1
   */
  selectLine: function(x,y) {
    let closestIndex = this.findClosestIndex(x, y);
    let line = this.lines[closestIndex];
    if ((line !== undefined) && line.some(l => l.squareDistanceFrom(x, y) <= 100 )) { // only want lines within 10 pixels
      this.selectedLineIndex = closestIndex;
    } else {
      this.selectedLineIndex = -1;
    }
  },

  /**
   * Removes the line Array closest to (x,y) from the list
   */
  eraseLine: function(x,y) {
    let closestIndex = this.findClosestIndex(x, y);
    if (closestIndex > -1) {
      this.lines.splice(closestIndex, 1);
    }
  },

  /**
   * If the user hasn't clicked anywhere yet, records the click as the first point.  If a click has
   * already been recorded, instantiates a line and adds it to the list of line Arrays.
   */
  drawLine: function(x,y) {
    if(!this.pos) {
      // save first click of the line
      this.pos = [ x, y ];
    } else {
      // create the line and add to the list
      let x0 = this.pos[0], y0 = this.pos[1];
      let line = new Line(x0, y0, x, y);
      let objectLine = [ line ];
      this.lines.push(objectLine);
      this.pos = null;
    }
  },

  /**
   * Draws the line Arrays from the list.  If a given line Array is "selected", circle indicators
   * are added to the ends of those lines.
   */
  render: function() {
    if (this.canvas) {
      let ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.lines.forEach((objectLines, index) => {
        objectLines.forEach(line => {
          line.draw(ctx);
          if (index === this.selectedLineIndex) {
            line.drawEnds(ctx);
          }
        });
      });
    }
  },
}).init();

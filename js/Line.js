var Line = function(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
//  this.length = Geometry.distance(x1, y1, x2, y2);
};

Line.prototype.draw = function(ctx) {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(this.x1, this.y1);
  ctx.lineTo(this.x2, this.y2);
  ctx.stroke();
};

Line.prototype.drawEnds = function(ctx) {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  var drawEnd = function(x, y) {
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };
  drawEnd(this.x1, this.y1);
  drawEnd(this.x2, this.y2);
};

Line.prototype.move = function(dx, dy) {
  this.x1 += dx;
  this.y1 += dy;
  this.x2 += dx;
  this.y2 += dy;
};

Line.prototype.checkDisallowMove = function(dx, dy, ctx) {

  if (!(this.x1 + dx).between(0, ctx.width)) return true;
  if (!(this.x2 + dx).between(0, ctx.width)) return true;
  if (!(this.y1 + dy).between(0, ctx.height)) return true;
  if (!(this.y2 + dy).between(0, ctx.height)) return true;

  return false;
};

Line.prototype.squareDistanceFrom = function(x, y) {
  let x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
  return Geometry.squareDistanceToSegment(x, y, x1, y1, x2, y2);
};

//  Here is a custom game object
Tile = function (game, x, y, tileImage, isVertical, i, j, k, type) {

  Phaser.Sprite.call(this, game, x, y, tileImage);
  this.anchor.setTo(0.5, 0.5);

  if(i === 6 && j === -3) players[1].location = {
    'x': x,
    'y': y,
    'i': i,
    'j': j,
    'k': k,
    'direction': 1
  }
  if(i === 6 && j === 9) players[2].location = {
    'x': x,
    'y': y,
    'i': i,
    'j': j,
    'k': k,
    'direction': 4
  }

  this.name = 'tile'+i+'_'+j+'_'+k;
  this.type = type;
  this.i = i;
  this.j = j;
  this.k = k;

  this.inputEnabled = true;
  this.input.useHandCursor = true;
  // this.events.onInputOut.add(this.rollOut, this);
  this.events.onInputOver.add(this.rollOver, this);
  this.events.onInputUp.add(this.upClick, this);
  this.marked = false;
};

// Contstruct Tile
Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

// display border frame sprite on mouse over
Tile.prototype.rollOver = function() {
  tileMouseOver.x = this.x;
  tileMouseOver.y = this.y;
  tileMouseOver.visible = true;
};
// Console log the tile that we have clicked on
Tile.prototype.upClick = function() {
  if(this.marked) {
    Game.prototype.unHighlightMoves();
    Game.prototype.moveToCoordinates([this.i, this.j, this.k]);
  }
};

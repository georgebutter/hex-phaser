/*
TODO:
Create interface and disablement manager
Create non-traversable edged tiles
Create tile spritesheet
Update opponents view with sockets
*/

var Game = function(game) {};
// Game map 0 = EMPTY, 1 Grass, 2 Stone
var tileMap = [
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,0],
  [2,1,1,1,1,1,1,1,1,1,1,2],
  [1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0]
];

var bmpText,
    phaseText,
    turnText,
    tileMouseOver,
    highlightedCoords,
    directionalArrows,
    arrowsArray = [],
    soulstones = {},
    orbs = {},
    stoneColours = ["red", "yellow", "green", "cyan", "blue", "magenta"],
    players = {
      1: {
        number: 1,
        location: {},
        speed: 1,
        cursor: {}
      },
      2: {
        number: 1,
        location: {},
        speed: 1,
        cursor: {}
      }
    }
    debug = false,
    tileHeight = 65,
    tileWidth = 65,
    tileVOffset = 24,
    playerSpriteSize = 32,
    playerTurn = 1;

Game.prototype = {

  preload: function () {
    this.optionCount = 1;
    game.load.nineSlice('ui-bar', 'assets/images/interface-bar-nine-slice.png', 25);
  },

  create: function () {

    if (debug) {
      debugGroup = game.add.group();
    }

    console.log(Match.players)
    for (var id in Match.players) {
      if (Match.players.hasOwnProperty(id)) {
        console.log(Match.players[id])
        if(Match.players[id].goesFirst === true) {
          players[1].name = Match.players[id].player.name;
          players[1].socket = Match.players[id].player.socket;
          players[1].id = Match.players[id].player.id;
        } else {
          players[2].name = Match.players[id].player.name;
          players[2].socket = Match.players[id].player.socket;
          players[2].id = Match.players[id].player.id;
        }
      }
    }

    // execute create level function
    createMap();
    addPlayers();
    createInterface();
    this.start();

    if (debug) {
      game.world.bringToTop(debugGroup);
      debugGroup.position.x = tileWidth/2;
      debugGroup.position.y = tileHeight/2;
      console.log(debugGroup)
    }

    function createMap() {
      // grid is now an object of game objects
      grid = game.add.group();
      // Set the coordinates of the grid group
      grid.x = 0;
      grid.y = 12;
      // Variables we will use to layout the tiles in the grid
      var verticalOffset = tileHeight*3/4,
          horizontalOffset = tileWidth,
          startX,
          startY,
          startXInit = tileWidth/2,
          startYInit = tileHeight/2,
          tile;

      // loop through the arrays within the tile map array
      for (var i = 0; i < tileMap.length; i++) {
        // if i modulous 2. i.e is it odd or even set the starting x-axis variable
        // to indent the grid on every other row
        i%2 == 0 ? startX = startXInit : startX = 2*startXInit;
        //Set he starting y axis to the loop index times by the row count
        startY = startYInit+(i*verticalOffset);

        // Loop through each of the values in our row arrays
        for (var j = 0; j < tileMap[i].length; j++) {
          // Axial co-ordinate conversion
          var cubicI = i;
          var cubicJ = j - (Math.floor(i/2));
          var cubicK = -cubicI - cubicJ;


          if (debug) {
            var coordinateText = game.add.text(startX, startY, cubicI+", "+cubicJ+", "+cubicK);
            coordinateText.font = "arial";
            coordinateText.fontSize = 12;
            debugGroup.add(coordinateText);
          }
          // if tileMap [row] [column] does equal 1
          if(tileMap[i][j] != 0){
            // construct a new time to our game at the location that we have just calculated using our custom game pbject from tile.js
            tile = new Tile(game, startX, startY, (tileMap[i][j]-1), false, cubicI, cubicJ, cubicK, tileMap[i][j]-1);
            // Add the new tile to our grid group
            grid.add(tile);
          }
          // increment the horizontal coord
          startX += horizontalOffset;
        }

      }
    }


    // Add our players to their starting positions
    // TODO: Turn players into a constructor
    function addPlayers() {
      players[1].group = game.add.group();
      players[1].group.x = players[1].location.x
      players[1].group.y =players[1].location.y
      players[1].sprite = game.add.sprite(0, 0, 'player', 4, players[1].group);
      players[1].sprite.anchor.setTo(0.5, 0.5);
      players[1].sprite.animations.add('walk1', [4,5,0,1,2,3]);
      players[1].sprite.animations.add('walk2', [10,11,6,7,8,9]);
      players[1].sprite.animations.add('walk3', [16,17,12,13,14,15]);
      players[1].sprite.animations.add('walk4', [22,23,18,19,20,21]);
      players[1].sprite.animations.add('walk5', [28,29,24,25,26,27]);
      players[1].sprite.animations.add('walk6', [34,35,30,31,32,33]);

      players[1].orbsArray = [0,0,0];
      players[1].orbs = game.add.group(players[1].group);
      var tX = 25;
      var tY = 14.434;
      players[1].orbs.x = 0;
      players[1].orbs.y = -16;

      players[1].orbs[1] = game.add.sprite(50-tX, 0-tY, 'orbs', 3, players[1].orbs);
      players[1].orbs[2] = game.add.sprite(0-tX, 0-tY, 'orbs', 0, players[1].orbs);
      players[1].orbs[3] = game.add.sprite(25-tX, 43.301-tY, 'orbs', 0, players[1].orbs);

      for (var i = 1; i <= 3; i++) {
        var iX = Math.random() * (10 - 0) + 0;
        var iY = Math.random() * (10 - 0) + 0;
        players[1].orbs[i].floating = game.add.tween(players[1].orbs[i]).to( { x: '+'+iX, y:'+'+iY, alpha: 0.7}, 500, Phaser.Easing.Linear.None, true, 0, -1);
        players[1].orbs[i].floating.yoyo(true, Math.random() * (50 - 0) + 0)
      }


      players[1].orbs[1].anchor.setTo(0.5);
      players[1].orbs[2].anchor.setTo(0.5);
      players[1].orbs[3].anchor.setTo(0.5);

      players[1].orbs[1].type = 0;
      players[1].orbs[2].type = 0;
      players[1].orbs[3].type = 0;

      var orbSpinning = game.add.tween(players[1].orbs).to({angle: 359}, 3000, null, true, 0, Infinity);

      players[2].sprite = game.add.sprite(players[2].location.x, players[2].location.y, 'player', 22, grid);
      players[2].sprite.anchor.setTo(0.5, 0.5);
      players[2].sprite.animations.add('walk1', [4,5,0,1,2,3]);
      players[2].sprite.animations.add('walk2', [10,11,6,7,8,9]);
      players[2].sprite.animations.add('walk3', [16,17,12,13,14,15]);
      players[2].sprite.animations.add('walk4', [22,23,18,19,20,21]);
      players[2].sprite.animations.add('walk5', [28,29,24,25,26,27]);
      players[2].sprite.animations.add('walk6', [34,35,30,31,32,33]);
    }

    function createInterface() {
      this.uibar = game.add.nineSlice(0, (600), 'ui-bar', null, 800, 93);
      game.add.existing(this.uibar);

      soulStones = game.add.group();
      // soulStones.anchor.setTo(0.5,0.5);
      soulStones.x = game.world.centerX-(74*2.5);
      soulStones.y = 610;
      soulStones.stones = {};
      for (var i = 0; i < stoneColours.length; i++) {
        soulStones.stones[i] = game.add.sprite((i*74), 0, 'interface-soul-stones', i, soulStones);
        soulStones.stones[i].color = stoneColours[i];
        soulStones.stones[i].alpha = 0.5;
        soulStones.stones[i].events.onInputDown.add(function() {
          _this.invokeMana(this.color, this)
          console.log('down')
        }, soulStones.stones[i]);
      }

      turnText = game.add.text(0, 0, players[playerTurn].name+"'s turn", {
            font: "16px Menlo",
            fill: "#8be9fd"
      });

      phaseText = game.add.text(0, 25, "Choose Direction", {
            font: "16px Menlo",
            fill: "#8be9fd"
      });
      // add some interface sprites and hide them for later use
      // Tile Cursor
      tileMouseOver = game.add.sprite(0, 0, 'interface-mouseover-tile', 0, grid);
      tileMouseOver.anchor.setTo(0.5, 0.5);
      tileMouseOver.visible = false;
      // Active player cursor
      // players[1].cursor = game.add.sprite(0, 0, 'player1-cursor', 0, grid);
      // players[1].cursor.anchor.setTo(0.5, 0.5);
      // players[1].cursor.visible = false;
      // Directional arrows
      directionalArrows = game.add.group(grid, 'directionalArrows');
      directionalArrows.visible = false;

      // Right         game, x, y, image, angle, direction
      arrow1 = new Arrow(game, (tileWidth + 25), (tileHeight/2), 'interface-direction-arrow', 0, 1);
      // Bottom Right
      arrow2 = new Arrow(game, tileWidth, (tileHeight+12.5), 'interface-direction-arrow', 60, 2);
      // Bottom left
      arrow3 = new Arrow(game, 0, tileHeight+12.5, 'interface-direction-arrow', 120, 3);
      // Left
      arrow4 = new Arrow(game, (-25), (tileHeight/2), 'interface-direction-arrow', 180, 4);
      // Top left
      arrow5 = new Arrow(game, 0, -12.5, 'interface-direction-arrow', 240, 5);
      // Top right
      arrow6 = new Arrow(game, tileWidth, -12.5, 'interface-direction-arrow', 300, 6);

      console.log(directionalArrows)
      console.log(arrowsArray)
    }

    // function pushNeighbour(i,j, tempArray){
    //   var newPt=new Phaser.Point();
    //   if(!checkforBoundary(i,j)){
    //     if(!checkForOccuppancy(i,j)){
    //       newPt=new Phaser.Point();
    //       newPt.x=i;
    //       newPt.y=j;
    //       tempArray.push(newPt);
    //     }
    //   }
    // }

  },

  start: function() {
    console.log(players[playerTurn])
    if(players[playerTurn].id === Player.id) {
      this.displayAvailableDirections(players[playerTurn]);
    }
  },

  getKeyByValue: function(obj, value) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        if(obj[prop] === value)
          return prop;
      }
    }
  },

  displayAvailableDirections: function(player) {

    /*
      Directions are numerical starting at the right going Anti-clockwise
         5 /  \ 6
        4 |    | 1
         3 \  / 2
    */

    var availableDirections = [];
    var tempDirection;

    currentDirection = player.location.direction;
    availableDirections.push(currentDirection);

    for (var v = 1; v < player.speed+1; v++) {
      // Turning Clockwise
      tempDirection = currentDirection + v;
      if(tempDirection > 6) tempDirection = tempDirection - 6;
      availableDirections.push(tempDirection);

      // Turning Anti-clockwise
      tempDirection = currentDirection - v;
      if(tempDirection < 1) tempDirection = tempDirection + 6;
      availableDirections.push(tempDirection);
    }

    directionalArrows.x = player.location.x - (tileWidth/2);
    directionalArrows.y = player.location.y - (tileHeight/2);
    directionalArrows.visible = true;

    for (var g = 0; g < availableDirections.length; g++) {
      var arrowIndex = availableDirections[g];
      arrowsArray[arrowIndex-1].visible = true;
    }

    // Make the available diretions visible
    directionalArrows.visible = true;
    // display the direction with an arrow or with some other ui element

    // once the user selects a direction update the player sprite to face in that direction and update the player object
  },


  highlightMoves: function(coords) {
    console.log(coords)
    highlightedCoords = coords;
    // TODO: Add detection for if the tile is traversable
    for (var i = 0; i < coords.length; i++) {
      var tempTile = grid.getByName('tile'+coords[i][0]+'_'+coords[i][1]+'_'+coords[i][2]);
      if(tempTile) {
        tempTile.tint = 0x8BE9FD;
        tempTile.marked = true;
      }
    }
  },

  displayAvailableMoves: function(player) {
                      // grid coords, direction, distance, including location
    var moves = this.getInFront(player.location, player.location.direction, player.speed, true);
    this.highlightMoves(moves);
  },

  changeDirection: function(player, direction) {
    console.log(player)
    // Turn the player
    player.location.direction = direction;
    player.sprite.frame = (direction*6)-2;
    // update interface text
    phaseText.setText("Choose move");
    // highlight and make active avilable moves
    this.displayAvailableMoves(player);
  },

  distanceBetweenTwoPoints: function(one, two) {
    console.log(one)
    console.log(two)
    return Math.sqrt((Math.pow(two.i - one.i, 2)) + (Math.pow(two.j - one.j, 2)));
  },

  moveToCoordinates: function(coords) {
    var _this = this;
    var destination = grid.getByName('tile'+coords[0]+'_'+coords[1]+'_'+coords[2]);
    var direction = players[playerTurn].location.direction;
    var distance = this.distanceBetweenTwoPoints(players[playerTurn].location, destination);
    var startCallback = function() {
      players[playerTurn].sprite.animations.play('walk'+direction, 12, true);
    };
    var completeCallback = function() {
      players[playerTurn].sprite.animations.stop()
      players[playerTurn].sprite.frame = (direction*6)-2;
      _this.pickMana();
    };

    console.log(distance)

    // Start the walking animation

    if(distance > 0) {
      // define the tween to the                                                   //multiply the distance by 600 so the speed is the same to any desination
      console.log(players[playerTurn].group)
      var tween = game.add.tween(players[playerTurn].group).to( { x: destination.x, y: destination.y-(destination.verticalOffset/2) }, 600*distance, null, true);
      // add the callbacks
      tween.onStart.add(startCallback, this)
      tween.onComplete.add(completeCallback, this);
      console.log(players[playerTurn].group)
    } else {
      this.pickMana();
    }
  },

  unHighlightMoves: function() {
    var coords = highlightedCoords;
    for (var i = 0; i < coords.length; i++) {
      var tempTile = grid.getByName('tile'+coords[i][0]+'_'+coords[i][1]+'_'+coords[i][2]);
      if(tempTile) {
        tempTile.tint = 0xFFFFFF;
        tempTile.marked = false;
      }
    }
    highlightedCoords = [];
  },

  getNeighbours: function(location) {
    // i and j refer to the grid coordinates
    var neighbours = [];
    var tempArray = [];
    var tempi = location.i;
    var tempj = location.j;
    var newi;
    var newj;
    // The differences they have in common are:
    // [0, +1], [+1, 0], [0, -1], [-1, 0]
    var commonChanges = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ];
    var evenChanges = [
      [1, 1],
      [-1, 1]
    ];
    var oddChanges = [
      [1, -1],
      [-1,-1]
    ];


    // Loop through the common changes
    for (var i = 0; i < commonChanges.length; i++) {
      // Empty the temporary array
      tempArray = [];
      // capture the changes
      newi = tempi + commonChanges[i][0];
      newj = tempj + commonChanges[i][1];
      // Push the new coords
      tempArray.push(newi, newj);
      // push the coords array
      neighbours.push(tempArray);
    }


    if((location.i % 2) === 0) {
      // i co-ordinate is even
      for (var i = 0; i < evenChanges.length; i++) {
        // Empty the temporary array
        tempArray = [];
        // capture the even changes
        newi = tempi + evenChanges[i][0];
        newj = tempj + evenChanges[i][1];
        // Push the new coords
        tempArray.push(newi, newj);
        // push the coords array
        neighbours.push(tempArray);
      }
    } else {
      // i co-ordinate is odd
      for (var i = 0; i < oddChanges.length; i++) {
        // Empty the temporary array
        tempArray = [];
        // capture the even changes
        newi = tempi + oddChanges[i][0];
        newj = tempj + oddChanges[i][1];
        // Push the new coords
        tempArray.push(newi, newj);
        // push the coords array
        neighbours.push(tempArray);
      }
    }

    return neighbours;
  },

  getInFront: function(location, direction, distance, includingLocation) {
    includingLocation = includingLocation || false;
    var coords = [],
        loc = [location.i, location.j, location.k],
        directions = {
          1: [0, 1, -1],
          2: [1, 0, -1],
          3: [1, -1, 0],
          4: [0, -1, -1],
          5: [-1, -1, -1],
          6: [-1, 1, 0]
        },
        dir = directions[direction];
    includingLocation ? coords[0] = loc : coords = [];

    function nextTile(a) {
      var temp = [];
      for (var b = 0; b < dir.length; b++) {
        temp[b] = (loc[b] + (dir[b]*a));
        // console.log(''+loc[b]+' + '+dir[b]+' = '+ temp[b]);
      }
      return temp
    }

    for (var a = 1; a < distance+1; a++) {
      coords.push(nextTile(a));
    }
    return coords;
  },

  pickMana: function() {
    _this = this;
    phaseText.setText("Pick mana");
    for (var i = 0; i < stoneColours.length; i++) {
      soulStones.stones[i].alpha = 1;
      soulStones.stones[i].inputEnabled = true;
      soulStones.stones[i].input.useHandCursor = true;
    }
  },

  invokeMana: function(color, stone) {
    console.log(stone)
    for (var i = 0; i < stoneColours.length; i++) {
      soulStones.stones[i].alpha = 0.5;
      soulStones.stones[i].inputEnabled = false;
      soulStones.stones[i].input.useHandCursor = false;
    }
    var index = stoneColours.indexOf(color);
    var length = players[playerTurn].orbsArray.length
    if (length <= 2) {
      players[playerTurn].orbs[length+1].frame = (index+1);
      players[playerTurn].orbsArray.splice(length+1, 0, index+1);
    } else {
      players[playerTurn].orbsArray.splice(0, 1);
      players[playerTurn].orbsArray.splice(2, 0, index+1);
      console.log(players[playerTurn].orbsArray)

      players[playerTurn].orbs[1].frame = players[playerTurn].orbsArray[0];
      players[playerTurn].orbs[2].frame = players[playerTurn].orbsArray[1];
      players[playerTurn].orbs[3].frame = players[playerTurn].orbsArray[2];
    }

    this.displayAvailableDirections(players[playerTurn]);
    // console.log(index)
  },

  opponentChangedDirection: function(direction) {
    this.changeDirection(players[playerTurn], direction);
    console.log(direction);
  }
};

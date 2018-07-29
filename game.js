'use strict';

class Vector{
  constructor(x = 0, y = 0){
    this.x = x;
    this.y = y;
  }
  plus(move){
    if (!(move instanceof Vector)) throw err;
    let x = this.x + move.x;
    let y = this.y + move.y;
    return new Vector(x, y);
  }
  times(mul){
    return new Vector(this.x * mul, this.y * mul);
  }
}

class Actor{
  constructor(pos = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0)){
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(size instanceof Vector)) throw err;
    this.pos = pos; this.size = size; this.speed = speed;
    this.act = function(){};
    
    Object.defineProperty(this, 'left', {
    get: function (){ return this.pos.x},
    set: function (val){this.pos.x = val}
    });
    Object.defineProperty(this, 'top', {
    get: function (){ return this.pos.y},
    set: function (val){this.pos.y = val}
    });
    Object.defineProperty(this, 'right', {
    get: function (){ return this.pos.x + this.size.x},
    set: function (val){this.pos.x = val - this.size.x}
    });
    Object.defineProperty(this, 'bottom', {
    get: function (){ return this.pos.y + this.size.y},
    set: function (val){this.pos.y = val - this.size.y}
    });
    Object.defineProperty(this, 'type', {
    value: 'actor',
    writable: true,
    configurable: true
    });
  }
  
  isIntersect(movinObject){
    if (movinObject == 'undefined' || !(movinObject instanceof Actor)) throw err;

    if (movinObject == this) return false
    else if ( 
      movinObject.left < this.right &&
      movinObject.right > this.left &&
      movinObject.top < this.bottom &&
      movinObject.bottom > this.top ) return true;
    else return false
  }
}



class Level {
  constructor(grid, actors)
  {
    this.grid = grid;
    this.actors = actors;
    this.player = 'player';
    Object.defineProperty(this, 'height',{
      get: function(){ return grid.length}
    });
    Object.defineProperty(this, 'width ',{
      get: function(){ return grid[0].length}
    });
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished(){
    if (this.status !== null && this.finishDelay < 1) return true;
    else return false;
  }
  actorAt(movinActor){
    if (movinActor == 'undefined' || !(movinActor instanceof Actor)) throw err;
    this.actors.forEach( (someActor) => {

          if (typeof(someActor.isIntersect) == 'function') {/*
            console.log('\n\n\nFunc1------------------\n\n', someActor.isIntersect );
            console.log('Actor', someActor ,'\n\n');*/
            if(someActor.isIntersect(movinActor)) return Actor;
          }
          else { /*
            console.log('\n\n\nFunc2------------------\n\n', someActor.prototype.isIntersect);
            console.log('Actor', someActor ,'\n\n')*/
            if(someActor.prototype.isIntersect(movinActor)) return Actor;
          }
    })
  }
  obstacleAt(pos,size){
    if (!(pos instanceof Vector) || !(size instanceof Vector) ) throw err;
    let obstacle = new Actor(pos,size);
    
    if (obstacle.bottom < 0) return 'lava';
    if (obstacle.top > this.height || obstacle.left < 0 || obstacle.right > this.width ) return 'wall';
    return this.actorAt(obstacle);
  }
  
  removeActor(deleteActor){
    this.actors.forEach( (Actor, i) => {
      if (deleteActor == Actor) this.actors.splice(i, 1);
    });
  }
  noMoreActors(hasType){
    //console.log('\nnoMoreActorsArray', this.actors);
    let flag = true;
    this.actors.forEach((someActor) => {
      if (someActor.type == hasType) {
        flag = false;

      }
    })
    //if (flag === true) console.log(hasType, 'no more!!!!\n');
    //else console.log(hasType, 'has more!!!!\n');
    return flag; 
  }
  playerTouched(type, actor){
    if (this.status !== null) return 0;
    if (type == 'lava' || type == 'fireball') {
      this.status = 'lost';
    }
    if (type == 'coin'){
      let i = this.actors.indexOf(actor);
      this.actors.splice(i, 1);
      if (this.noMoreActors('coin')) this.status = 'won';
    }
  }
}


class LevelParser {
  constructor(book){
    this.book = book;
  }
  actorFromSymbol(sym){
    return this.book[sym]
  }
  
  obstacleFromSymbol(sym){
    if (sym == 'x') return 'wall';
    else if (sym == '!') return 'lava';
    else return undefined;
  }
  
  createGrid(array){
    let grid = []
    array.forEach( (line) => {
      let gridLine = [];
      line.split('').forEach( (symb) =>{
        gridLine.push(this.obstacleFromSymbol(symb));
      });
      grid.push(gridLine);
    })
    return grid;
  }
  
  createActors(array){
     let actorsArr = []
    array.forEach( (line, y) => {
      line.split('').forEach( (symb, x) =>{
        let transSymb = this.actorFromSymbol(symb);
        if (transSymb !== undefined){
          let newActor = new Actor(new Vector(x,y))
          
          actorsArr.push(newActor);
        }
        
      });
    })
    return actorsArr;
  }
  
  parse(array){
    let obj = {};
    obj.grid = this.createGrid(array);
    obj.actors = this.createActors(array);
    return obj;
  }
}


class Fireball extends Actor{
  constructor(pos = new Vector(0,0), speed = new Vector(0,0)){
    let size = new Vector(1,1);
    super(pos,size,speed);
    
    //this.pos = pos; this.size = size; this.speed = speed;
    
    Object.defineProperty(this, 'type', {
    value: 'fireball',
    });
  }
  
  getNextPosition(time = 1){
    return new Vector(
    this.pos.x + time * this.speed.x,
    this.pos.y + time * this.speed.y
    )
  }
  
  handleObstacle(){
    this.speed.x -= this.speed.x * 2;
    this.speed.y -= this.speed.y * 2;
  }
  
  act(time, level){
    let nextPosition = this.getNextPosition(time);
    if (level.obstacleAt(nextPosition, this.size) === undefined){
      this.pos = nextPosition;
    }
    else  {
      this.handleObstacle()
    }
  }
}

class HorizontalFireball extends Fireball{
  constructor(pos){
    return new Actor(pos, new Vector(1,1),new Vector(2,0))
  }
}

class VerticalFireball extends Fireball{
  constructor(pos){
    return new Actor(pos, new Vector(1,1),new Vector(0,2))
  }
}

class FireRain extends Fireball{
  constructor(pos){
    this.initialPos = pos;
    return new Actor(pos, new Vector(1,1),new Vector(0,3))
  }
  handleObstacle(){
    this.pos = this.initialPos;
  }
}

class Coin extends Actor{
  constructor(pos){
    let size = new Vector(0.6,0.6);
    let nextPos = new Vector(pos.x - 0.2, pos.y - 0.1)
    super(nextPos,size);
    Object.defineProperty(this, 'type', {
    value: 'coin',
    });
    this.basePos = pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
  }
  updateSpring(time = 1){
    this.spring += this.springSpeed * time;
  }
  getSpringVector(){
    return new Vector(0, Math.sin(this.spring) * this.springDist)
  }
  getNextPosition(time){
    this.updateSpring(time);
    let springVector = this.getSpringVector();
    return new Vector(this.pos.x, this.basePos.y + springVector.y);
  }
  act(time){
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor{
  constructor(pos){
    let nextPos = new Vector(pos.x, pos.y - 0.5);
    super(nextPos, new Vector(0.8,1.5), new Vector(0,0));
    Object.defineProperty(this, 'type', {
    value: 'player',
    });
  }
  
}
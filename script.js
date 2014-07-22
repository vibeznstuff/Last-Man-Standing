/* ------ Game Clock ------ */
//The clock object keeps time game events with user decisions by pausing and resuming the game
function Clock(){
    var state = setInterval(function(){},1000);
    
    this.start = function(fxn){
        var func = fxn;
        state = setInterval(function(){func()},1000);
    };
    
    this.pause = function(){
        clearInterval(state);
    };
};

//Creates the game Clock
var timer = new Clock();
var rounds = 0;

var gameStarted = false;
var gameRunning = false;


/* -------- The Playing Field and GUI ------- */

//Keeps track of ID for Entities
var id = 0;
//Dimensions for the field
var WIDTH = 30;
var HEIGHT = 30;

//Reads the property values of an object
function readProps(entity){
    for (var prop in entity){
        if(typeof entity[prop] === "number"){
            console.log(prop + ": " + entity[prop]);
        };
    };
};

function convertToPixels(entity){
    var pos = entity.getPosition();
    return [pos[0]*20+315,pos[1]*20+75];
};

function addImage(entity, src){
    var img = document.createElement("IMG");
    img.setAttribute("src",src);
    img.setAttribute("width",20);
    img.setAttribute("height",20);
    img.setAttribute("id","pic" + entity.id);
    var loc = convertToPixels(entity);
    img.setAttribute("style","position:absolute; left:" + loc[0] + "px; top:" + loc[1] + ";");
    document.body.appendChild(img);
};

function removeImages(entities){
    for(var i in entities){
        var img = document.getElementById("pic" + entities[i].id);
        img.setAttribute("src","");
    };
};

function moveEntities(entities){
    for(var i in entities){
        var img = document.getElementById("pic" + entities[i].id);
        var loc = convertToPixels(entities[i]);
        img.setAttribute("style","position:absolute; left:" + loc[0] + "px; top:" + loc[1] + ";");
    };
};

/* ------ Defining the Classes ------ */

function randomWalk(pos,steps){
    for(var i = 0; i < steps; i++){
            var rand = Math.random();
            //Move down
            if (rand < 0.25){
                if(pos[1] === 0){
                    pos[1] = HEIGHT;
                } else {
                    pos[1] -= 1;
                };
                //console.log("down");
            //Move up
            } else if (rand < .50){
                if(pos[1] === HEIGHT){
                    pos[1] = 0;
                } else {
                    pos[1] += 1;
                };
                //console.log("up");
            //Move left
            } else if (rand < .75){
                if(pos[0] === 0){
                    pos[0] = WIDTH;
                } else {
                    pos[0] -= 1;
                };
                //console.log("left");
            //Move right
            } else {
                if(pos[0] === WIDTH){
                    pos[0] = 0;
                } else {
                    pos[0] += 1;
                };
                //console.log("right");
            };
        };
        return pos;
};

//An Entity has five forms of power: health, attack
//speed, defense and range. It is also randomly assigned
//to an (x,y) coordinate on the game map.
function Entity(health, attack, speed, defense, range){
    this.id = id;
    id += 1;
    this.health = health;
    this.attack = attack;
    this.speed = speed;
    this.defense = defense;
    this.range = range;
    var pos = [Math.round(Math.random()*WIDTH), Math.round(Math.random()*HEIGHT)];
    
    this.upgradeHealth = function(amt){
        this.health += amt;
    };
    
    this.upgradeAttack = function(amt){
        this.attack += amt;
    };
    
    this.upgradeSpeed = function(amt){
        this.speed += amt;
    };
    
    this.upgradeDefense = function(amt){
        this.defense += amt;
    };
    
    this.move = function(){
        pos = randomWalk(pos,this.speed);
    };
    
    this.getPosition = function(){
        return pos;
    };
    
    this.setPosition = function(arr){
        pos = arr;
    }
    
    this.canAttack = function(enemyPos){
        var xdist = Math.abs(pos[0] - enemyPos[0]);
        var ydist = Math.abs(pos[1] - enemyPos[1]);
        
        if(xdist <= this.range && ydist <= this.range){
            return true;
        } else {
            return false;
        };
    };
    
    this.confront = function(enemy){
        if(this.canAttack(enemy.getPosition())){
            enemy.health -= Math.max(this.attack - enemy.defense,0);
            if(enemy.canAttack(pos)){
                this.health -= Math.max(enemy.attack - this.defense,0);
            };
        } else {
            if(enemy.canAttack(pos)){
                this.health -= Math.max(enemy.attack - this.defense,0);
            };
        };
    };
};

//Demon is a subclass of Entity with the additional
//property soul, and methods getSouls and updateSouls
function Demon(health, attack, speed, defense, range){
    this.health = health;
    this.attack = attack;
    this.speed = speed;
    this.defense = defense;
    this.range = range;
    this.level = 1;
    var souls = 0;
    this.getSouls = function(){
        return souls;
    };
    
    this.evolve = function(){
        var img = document.getElementById("pic" + this.id);
        img.setAttribute("width",20*this.level);
        img.setAttribute("height",20*this.level);
        alert("The Demon has evolved!");
    };
    
    this.updateSouls = function(){
        souls += 1;
        this.health += 10;
        this.defense += 10;
        this.attack += 10;
        if(souls % 25=== 0 && this.level <= 4){
            this.speed += 1;
            this.range += 1;
            this.level += 1;
            this.evolve();
        };
    };
    
    this.brood = function(){
        this.health += 1;
        this.defense += 1;
        this.attack += 1;
    };
};

Demon.prototype = new Entity();

/* ----------- Game Objects + Params --------- */
//Human initial vital stats
var human_health = 100;
var human_attack = 10;
var human_speed = 1;
var human_defense = 20;
var human_range = 1;

//Array of available humans
var humans = [];

//Demon initial vital stats
var demon_health = 50;
var demon_attack = 5;
var demon_speed = 3;
var demon_defense = 0;
var demon_range = 2;

var the_demon = new Demon(demon_health, demon_attack, demon_speed, demon_defense, demon_range);

/* ---------- Game Engine ---------- */

//Upgrade Points
var points = 0;

var demonDead = false;
var humansDead = false;

//Adds a human to the game
function addHuman(){
    var human = new Entity(human_health, human_attack, human_speed, human_defense, human_range);
    humans.push(human);
    addImage(human,"http://fc03.deviantart.net/fs71/f/2013/226/f/2/mega_chief__mega_man_sprite___updated__by_melolzugaming-d59exrt.png");
};

//Returns if an entity is alive
var isAlive = function(entity){
        return entity.health > 0;
};

//Returns if an entity is alive
var isDead = function(entity){
        return entity.health <= 0;
};

//Removes dead humans
function removeDeadHumans(){
    var new_humans = humans.filter(isAlive);
    var num_killed = humans.filter(isDead).length;
    for (var i = 0; i < num_killed; i++){
        the_demon.updateSouls();
    };
    var the_dead = humans.filter(isDead);
    removeImages(the_dead);
    return new_humans;
};

//Upgrades Health
function upgradeHealth(){
    if(points >= 10){
        points -= 10;
        human_health += 50;
    } else {
        alert("Sorry, you don't have enough points to upgrade your health.");
    };
};

//Upgrades Attack
function upgradeAttack(){
    if(points >= 5){
        points -= 5;
        human_attack += 20;
    } else {
        alert("Sorry, you don't have enough points to upgrade your attack.");
    };
};

//Upgrades Defense
function upgradeDefense(){
    if(points >= 10){
        points -= 10;
        human_defense += 20;
    } else {
        alert("Sorry, you don't have enough points to upgrade your defense.");
    };
};

//Upgrades Range
function upgradeRange(){
    if(points >= 50){
        points -= 50;
        human_range += 1;
    } else {
        alert("Sorry, you don't have enough points to upgrade your Range.");
    };
};

//Adds an additional human as an upgrade
function upgradeHumans(){
    if(points >= 2){
        points -= 2;
        addHuman();
    } else {
        alert("Sorry, you don't have enough points to add a human.");
    };
};


//Completes one round of the game
function runGame(){
    
    //Update upgrade points
    points += 1;
    rounds += 1;
    
    the_demon.brood();
    
    //Display the number of deaths so far
    document.getElementById("soul count").innerHTML = "Souls consumed by demon: " + the_demon.getSouls();
    
    //Display the number of humans on the field
    document.getElementById("humans").innerHTML = "Humans on the field: " + humans.length;
    
    //Display the current amount of upgrade points
    document.getElementById("points").innerHTML = "Upgrade points available: " + points;
    
    //Display the Demon's vitals
    document.getElementById("demon status").innerHTML = "Demon's Health: " + the_demon.health + "<br> Demon's Attack: " + the_demon.attack + "<br> Demon's Speed: " + the_demon.speed + "<br> Demon's Defense: " + the_demon.defense + "<br> Demon's Range: " + the_demon.range;
    
    document.getElementById("desc").innerHTML = "Newly spawned humans will have <br> the following stats:"
    
    //Display the human specs
    document.getElementById("human status").innerHTML = "Human Health: " + human_health + "<br> Human Attack: " + human_attack + "<br> Human Speed: " + human_speed + "<br> Human Defense: " + human_defense + "<br> Human Range: " + human_range;
        
    if(demonDead){
        alert("Congrats, you defeated the dragon in " + Math.round(rounds/60) + " minutes.");
        timer.pause();
    } else if (humansDead){
        alert("...the Demon has won.");
        timer.pause();
    } else {
        the_demon.move();
        
        var evolved = the_demon.level > 1;
        if(evolved){
            var dpos = the_demon.getPosition();
            if(dpos[0] >= WIDTH - (the_demon.level - 2)){
                dpos[0] = 0;
            };
            if(dpos[1] >= HEIGHT - (the_demon.level - 2)){
                dpos[1] = 0;
            };
        };
            
        moveEntities([the_demon]);
        for(var i in humans){
            humans[i].confront(the_demon);
            if(isAlive(humans[i])){
                humans[i].move();
            };
        };
        moveEntities(humans);
    };
    
    humans = removeDeadHumans();
    
    if(humans.length === 0){
        humansDead = true;
    };
    if(the_demon.health <= 0){
        demonDead = true;
    };
    
     /* if(!demonDead && !humansDead){
        console.log("The Humans");
        console.log("-------");
        for(var i in humans){
            console.log("Human " + i);
            readProps(humans[i]);
            console.log(humans[i].getPosition());
            console.log("---");
        };
        console.log("");
        console.log("The Demon");
        console.log("-------");
        readProps(the_demon);
        console.log(the_demon.getPosition());
        console.log("");
        console.log("");
        console.log("");
        console.log("");
    }; */
};

function Pause(){
    if(gameRunning){
        timer.pause();
        gameRunning = false;
    };
};

/* ------------- Test Code ------------ 

//Tests Entity Upgrade methods
function testUpgrades(){
    var soldier = new Entity(100,10,1,2);
    readProps(soldier);
    soldier.upgradeHealth(1);
    soldier.upgradeAttack(1);
    soldier.upgradeSpeed(1);
    soldier.upgradeDefense(1);
    readProps(soldier);
};

//Tests Demon constructor and methods
function testDemon(){
    var demon = new Demon(10000,100,4,100);
    readProps(demon);
    demon.upgradeHealth(1);
    demon.upgradeAttack(1);
    demon.upgradeSpeed(1);
    demon.upgradeDefense(1);
    readProps(demon);
    
    console.log("Demon has " + demon.getSouls() + " souls before updating.");
    demon.updateSouls();
    console.log("Demon now has " + demon.getSouls() + " souls.");
};

//Tests randomWalk

function testWalk(){
    console.log(" ");
    console.log("Starting...");
    var me = new Entity(10,10,1,10);
    for(var i = 0; i < 10; i++){
       console.log("Position: " + me.getPosition());
       me.move();
    };
}; 

function testKillingHumans(){
for(var i = 0; i < 4; i++){
       addHuman();
   };
   for(var i = 0; i < 13; i++){
      console.log("Before " + i + ": Length is " + humans.length);
      humans[0].health -= 20;
      humans = removeDeadHumans();
      console.log("After " + i + ":Length is " + humans.length);
   };
}; */

//Tests from browser
function Resume(){
    if(!gameRunning){
        timer.start(runGame);
        gameRunning = true;
    };
    
    if(!gameStarted){
        alert("Try to kill the demon as fast as you can. Every second he grows stronger and its up to you to defeat him before he grows too powerful. Be careful of giving him souls for that will only make him stronger too. If all humans die, then the demon has won. Godspeed.");
        addHuman();
        addImage(the_demon,"http://i5.photobucket.com/albums/y196/kramwartap/SotD/WZD_SotD_arch_demon_sprite.gif");
        gameStarted = true;
    };
        
};


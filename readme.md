**2018 Edit**: This is an old project I made for school that I decided to put up on github.

I updated peerjs to work without api key, everything else is like it was when I turned it in. (bugs included)

***

# Web & Mobile Development 14-15 Project 2

## Initial idea
~~1 to 4 players can play together in an area where they have to survive as long
as possible while beating enemies. Extras like pickups or dynamic terrain are
possible.~~

During multiplayer all players fly around a planet with a few asteroids floating around. The goal is to kill all enemy heros and remain the last man standing.
During singleplayer there are a lot of asteroids floating around. The goal of the game is to break all big asteroids without getting hit.

The game itself would use the following technologies:
* WebRTC for the multiplayer part. Peerjs would be a nice library for this.
* Three.js for the 3d part. This is a library that makes using WebGL easier.
* Google Closure Compiler (+gulp). This is a compiler that can optimise
JavaScript code. It also allows the the developer to split the code into
multiple files and forces the developer to write good documentation.

## Screenshots
![Overview](https://github.com/lorgan3/clashOnInfiniteEarths/blob/master/img/screenshot8.png?raw=true)
![Takedown](https://github.com/lorgan3/clashOnInfiniteEarths/blob/master/img/screenshot2.png?raw=true)
![Player view](https://github.com/lorgan3/clashOnInfiniteEarths/blob/master/img/screenshot6.png?raw=true)
![Asteroid hit](https://github.com/lorgan3/clashOnInfiniteEarths/blob/master/img/screenshot4.png?raw=true)
![Debug mode](https://github.com/lorgan3/clashOnInfiniteEarths/blob/master/img/screenshot1.png?raw=true)

## Trying it out
### The game is available at: http://l3.ajf.me/web/project2/index.html#/ (might be outdated)

### Or can also be installed manually:
- clone the repo
- npm install in `googleclosure/`
- bower install in `/`
- composer install in `api/`
- Run `gulp compile` in `googleclosure/` to create the bundled javascript file for the game itself.
- Change the location of the API in app.js line 176
- Ready to go

## Used resources
### Sounds
- https://www.freesound.org/
- https://www.youtube.com/watch?v=WNVNHjs-skc

### Images / sprites
- http://celestia.h-schmidt.net/earth-vt/unshaded1024.jpg (earth texture)
- http://www.wired.com/images_blogs/wiredscience/2013/01/vesta.jpg (asteroid1)
- http://wise.ssl.berkeley.edu/gallery_images/V2-TwoAsteroids-image.jpg (asteroid2)

### 3D models
Custom made with blender

### JS libraries
- Angular
- Angular-route
- Angular-resource
- Angular-touch
- Angular-carousel
- NgDialog
- Peerjs
- Threejs
- Stats.js (threejs)
- Howler

---
Lennert Claeys

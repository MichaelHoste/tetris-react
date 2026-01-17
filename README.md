# Tetris-React

Play it here: https://tetris-react.80limit.com

https://github.com/user-attachments/assets/5dd83bf9-f39a-4028-b596-975cd3c337eb

## But... Why?

I recently saw the [Tetris movie](https://www.rottentomatoes.com/m/tetris) (great one!).
At one point, the main protagonist recreated Tetris on Game Boy in a very short time span.
I wanted to know if that was really possible.

Short answer: **yes**.

Long anwser: **not really** (see [Is the game really finished?](#is-the-game-really-finished)).

![It's not perfect, but you'll get the idea](https://raw.githubusercontent.com/MichaelHoste/tetris-react/master/misc/tetris-movie.gif)

## No, I meant... Why in React?

Oh, right!

My first impulse was to use something like [PixiJS](https://pixijs.com/). It's perfect for creating web games using 2D canvas or WebGL in a game loop.

I previously used it to create a [web clone of X-Moto](https://github.com/MichaelHoste/xmoto.js) (if you had Linux in the 2000s, you know what I'm talking about), and I had a great experience using it.

The drawing API was great, but creating a nice Tetris game with methods like this was too much work for a side-project:

```javascript
let obj = new PIXI.Graphics();
obj.beginFill(0xff0000);
obj.drawRect(0, 0, 200, 100);
app.stage.addChild(obj);
```

And then, I realized that if you look close enough, Tetris is **not a continuous game** with a classic game loop at 60FPS.
It's **more of a discrete game** where each redraw is only triggered by:

 * A tick of the clock (at first, one tick is about 0.8s, but it speeds up with the difficulty).
 * A keyboard input.
 
So rarely more than 2 to 10 redraws per second.

And each redraw can only do so much change (one tetromino moving or merging), so no need to redraw the full screen, just some cells.

**Pop Quizz!** What web technology would be great to manage a finite state, deal with some keyboard events, and only redraw the part of the screen that changed?
All of that, using well-known HTML/CSS to iterate quickly on the design?

Yep, **React**.

## Is the game really finished?

**No**, there are many subtleties that make it a truly interesting game and that are not implemented yet. 
Have you heard of [Wall Kick](https://harddrop.com/wiki/Wall_kick), [T-Spin](https://harddrop.com/wiki/T-Spin_Guide), and the many existing [Rotation Systems](https://harddrop.com/wiki/SRS)?

Me neither, before this project.

Some of these features are listed in the [TODO.md](TODO.md), but I'm a bit afraid that this would make the code a lot less clean.

## Is it a crime to create a clone of Tetris?

I'm really not sure. I mainly created this project for fun and, by extension, for educational purposes.

The rules of Tetris are so ingrained in pop culture, that it makes it a good example of how to create a game from scratch using very popular tools and libraries.

## How to run it?

* Install dependencies: `yarn`
* Start the game: `yarn start`
* Play it on [http://localhost:3000](http://localhost:3000)

The page will reload when you make changes in the code.

## How to deploy?

* `yarn build`
* Copy the content of the newly created `build` directory to a server.

## Do you like chocolate?

**I do!**

And so @didier-84 that forked this repository to create a Chocolate edition 🍫🇧🇪

==> [chocolat-tetris-react](https://github.com/didier-84/chocolate-tetris-react) <==

<img width="1020" alt="image" src="https://github.com/didier-84/chocolate-tetris-react/assets/2227137/d5a0cd4e-2120-4700-bbd5-bb5e744b3d86">


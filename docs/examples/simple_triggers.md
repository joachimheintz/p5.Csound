
## Simple triggers

The following sketch shows how a Csound instrument can be triggered from on screen events. In this case, collisions with the outer bounds of the sketch. 

[](/static_triggers/index.html ':include :type=iframe width=800px height=400px frameBorder=0 scrolling="no"')

The Csound instrument is loaded in the `preload()` function. 

```js
async function preload() {
    csound = await Csound.create({options:['-odac', '--0dbfs=1']});

    await csound.evalCode(`
    instr 1
    iDur = p3
    iAmp = p4
    iFreq = p5;
    aEnv expon iAmp, iDur, 0.001
    aSig oscil aEnv, iFreq
    outs aSig, aSig
    endin
    `);
  await csound.start();
}
```

The instrument, which produces a sine wave, with an exponential decay, is triggered to play each time a collision with the outer bounds of the sketch takes place. `csound.evalCode()` is called from the `display()` function of the Ball class whenever the ball's position moves past left, right, top or bottom of the sketch window.

```js
    if (this.position.x > width || this.position.x < 0) {
      this.direction.x *= -1;
      this.direction.mult(1);
      this.triggerSound();
    }

    if (this.position.y > height || this.position.y < 0) {
      this.direction.y *= -1;
      this.direction.mult(1);
      this.triggerSound();
    }
```

The `triggerSound()` function just wraps the following code, which sets a random frequency each time the function is called. 

```js
  triggerSound() {
    if (csound) {
      let freq = random(1000);
      csound.evalCode(`schedule(1, 0, 5, .1, ${freq})`);
    }
  }
```

> Note that it's a good idea to check that csound is not `null` before calling any Csound library methods. 


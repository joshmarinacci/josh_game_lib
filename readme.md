# josh's game lib



* effects: ParticleEffect, Fader, Wiggle effects.
* grid: grid data structure for tilemaps and other game data
* keyboard: manages the keyboard state
* math: Point, Size, Bounds, Insets, and random numbers
* physics: collisions between objects with rectangular bounds
* color: functions to convert colors to and from strings
* time: game timers



# tiny animation lib

Doesn't need before or after clauses because you can just use `await` with the promises
set any number of properties on a single animation as long as the same duration and
the same target. `over` is a synonym for `duration`. Chain them by using `await`.

If you need a straight-up delay, call `tween.delay()` for a number of seconds.

```javascript
async function fade(block) {
    await tween.delay(1) // wait 1 second before starting
    await tween.play(block,{
        from:{fill:'black'},
        to:{fill:'red'},
        over: 0.4, //seconds
    })
    block.fill = 'black' // happens after anim is done
} 

function tick(time) {
    this.update(time)
    tween.tick(time.delta)
    tihs.draw(time)
}
```



can interpolate points and bounds
```javascript
tween.play(block,{
    from:{position:block.position},
    to: {position:block.position.add(new Point(10,10))},
    over: 1,
})

```


wiggle-horiz example. orbits around the center point along the x axis with increasing amplitude.
```javascript
tween.play(block,{
    from:{position:block.position},
    to:{position:block.position},
    amplitude:100,
    count:10,
    lerp:(t,from,to,prop,anim) => {
        let amp = anim.amplitude * t
        let off = Math.sin(t*PI*2*anim.count)*amp
        return new Point(from.x+off,from.y)
    }
})
```

parameters are always copied, so you can save them as reusable animations to apply to different
targets as constants at the top of your game.

custom lerps for new types. if cannot lerp a value will just use the start value until t=1 then
switch to the end value.

any extra properties you pass will be on the tween object passed to the lerp function.

easings are functions that convert t to t.  default ones are provided.

Future ideas:
* render all easing functions on one page as an example. lines moving up and down and draw the curve
* interpolate Bounds and Size and Points. How?
* interpolate gradients to make weird effects. How would this work with varying stops?




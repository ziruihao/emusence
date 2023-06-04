# Emusence

*Emergence of the muses.*

[[Web demo](https://emusence.onrender.com)] and [[GitHub](https://github.com/ziruihao/emusence)]

<img width="1373" alt="cover" src="https://github.com/ziruihao/emusence/assets/45774151/31e3dc91-4e2a-43b9-918c-75e83e76183c">

```
1 Artist statement
2 Technical overview
	2.1 Flocking simulation
	2.2 Orchestra
	2.3 Musical mechanics
3 Evaluation
	3.1 Musical character
	3.2 Interactivity
	3.3 Project development process
```

## 1 Artist statement

We rarely hear nature in the techno-static of our digital society. Regretfully, nature is soft-spoken, never the flashiest nor the loudest. Pop jams and EDM raves beg for our attention while nature expresses itself in stoic whispers. The way birds flock or fish swarm together is one of nature's quiet delights. What happens if we give these whispers instruments? One bird a violin, another a flute. A small fish a piccolo, a big fish an oboe. As the entire flock dances in the sky, pushing and pulling, separating and conjoining, orbiting each other, circling over and under, endlessly shapeshifting. A self-organizing orchestra emerges from this mesmerizing complexity, nature its conductor.

## 2 Technical overview

### 2.1 Flocking simulation

I built a flocking simulation based on Craig Reynold's concept of boids. Each boid follows three simple movement rules:
1. Alignment — fly along the same direction as nearby boids
2. Cohesion — fly towards the centroid of nearby boids
3. Separation — fly away from boids that are too close

Mesmerizing flocking patterns emerge from these simple rules. The boids self-organize in cohesive clusters. Three weights control how strong each rule applies, and I experimented with many combinations until I settled on a `8:1:8` ratio.[^You can adjust this ratio to go between tight and loose flocks, regimented versus free-flowing movement.] There were also many other configurations, such as the scanning radius applied each of the rules, that I iterated for a long time before achieving what you see. I built this simulation engine in JavaScript and rendered all the graphics using the [P5.js](http://p5js.org) library. My end goal was an easily shareable URL to render and play this piece anywhere.

<img width="553" alt="rules" src="https://github.com/ziruihao/emusence/assets/45774151/3fc06ec4-ad0a-408b-8589-3438da592f95">

As you can see in the main demo video, the boids begin dispersed but slowly coalesce together, then occasionally separate and regroup. Hence, I added some interactivity so the viewer can influence the flight patterns and thus the musical character.
1. Obstacles — the boids must flow around these lily pads, thus they invite more tributary movement in smaller clusters
2. Predators — these boids chase other boids, causing rapid direction changes and scattering

<img width="751" alt="interactivity" src="https://github.com/ziruihao/emusence/assets/45774151/cb17bb47-e67c-491b-8246-a4e8c847fbf7">

### 2.2 Orchestra

I assembled an orchestral Ableton Live set with four main parts. First, a Tuba section forms bass line. French horns are the first melodic voice in the tenor range, and flutes as second melodic voice in the alto range. Finally, a vibraphone provides accompaniment in the soprano range.

The artistic intention behind all these instruments was to give a nod to nature. That is, they are all harmonious with nature. The mallets evoke the sound of water droplets. The flutes have the spirit of the wind. The french horn and tuba add an animalistic aliveness, harping on the sounds of bison, elephants, and wolves.

These synths are piped through a reverb effect before outputting to master. The spatial ambience of reverb alludes to the vastness of the sky or the ocean, environments that inspired this piece.

<img width="1325" alt="Ableton Live set" src="https://github.com/ziruihao/emusence/assets/45774151/e2272c97-d277-4078-9af4-2796d09ed3b5">

### 2.3 Musical mechanics

In essence, every boid has the opportunity to be a voice in the orchestra. On every animation frame (60 FPS), a subset of boids are randomly chosen to "play" as an instrument of the orchestra. On average, only a few notes are played per second, but I added an adjustable "cadence" knob to control this pace.

Chosen boids will play depending on several aspects of their movement. We primarily focus on the flock clustering. I used a density-based clustering called DBSCAN, using the open source JavaScript implementation by [upphiminn](https://github.com/upphiminn/jDBSCAN). I chose DBSCAN because it automatically deduces the number of clusters, whereas other algorithms like K-Means requires that as a starting parameter. Since the flock is so amorphous, it doesn't make sense to have a preset number of clusters. The screenshot below shows are how the boids are grouped together with their neighbors.

![clustering](https://github.com/ziruihao/emusence/assets/45774151/1dfa7002-d369-4c5e-b161-6d3dd5ce2e24)

In general, larger clusters of boids provide the tectonic bass movement for the orchestra, while smaller clusters provide the melodies. Straggler boids that wander away from clusters represent the accompaniment percussions. This table below details the precise mechanics between physical movement and music.

|  | Outliers | Small | Medium | Large |
|:--|:--|:--|:--|:--|
| Cluster size | < 6 | < 24 | < 48 | ≥ 48 |
| Pitch range | Soprano | Alto | Tenor | Bass |
| Tempo | ♪ (1/8) | ♩ (1/4) | ♩ (1/4) | o (1) |
| Mode | Melody | Melody | Melody | Chords |
| Sampling multiplier | 512x | 64x | 32x | 1x |
| Instrument | Vibraphone | Flute | French Horn | Tuba |

As shown in the last row, a boid's likelihood to be chosen is not uniform. This is to amplify the higher-pitched outliers which are definitionally less in number, while taming down the bass boids which are more in number.

The tonality of the piece is determined by the radial direction in which the boids fly. The movement begins on the C Major key, but at any given time, there is a collective direction towards which all boids are flying. This average heading is a dial that "pushes" the current key signature around the circle of fifths. For instance, if the boids collectively start heading Eastward, the dial would gradually nudge the key from C Major to G, D, and eventually, A Major.

Thus, the piece's tone follows fluid transitions driven by the directionality of the boids' movements. Since any two adjacent keys on the circle of fifths sound consonant, the piece progresses harmoniously yet distinctly.

These tonality dynamics also fit the predator chase scenarios. Visibly, the prey boids are alarmed and dart away from the predator. In terms of musical mechanics, the fleeing boids will play from the key signature directly opposite of the current key. So if the piece's key is C Major, fleeing boids will play from F# Major, thereby injecting dissonance into the piece as the predator approaches them.

## 3 Evaluation

### 3.1 Musical character

What this piece does well is maintaining a spontaneous, natural spirit. Every moment gives off a sonic freshness that keeps the tone lively and dynamic. The ebb and flow from tectonic bass movements to surprise percussion ornaments has a well-paced  periodicity. Overall, the music pulses like nature because of its improvisational element. Nature doesn't plan. Nature welcomes impulse.

The timbre element is also in harmony with nature. I feel that flutes are intrinsically natural-sounding, literally the currents of wind. The brass (tuba and french horn) still has the character of wind, but are more animal-like; they add metabolism to the piece. The mallet accompaniment alludes to the sound of water droplets. Overall, no facet of the timbre feels too abstract or artificial.

### 3.2 Interactivity

I enjoyed interacting with the piece through setting obstacles for the flocks to swim around or summoning chasing predators. Obstacles determine the overall complexity of the music. The navigation logic, however, simply avoids obstacles, instead of finding optimal ways around them. If I had more time, I would leverage some path-finding algorithms to truly push the flocks through mazes of obstacles. Predators add dissonance very abruptly. It's very immediate and distinguishable. If I had more time, I would find ways to make the tonal shift more gradual and anticipatory.

### 3.3 Project development process

The biggest hurdle was finding the optimal configurations for all the "hyperparameters" for this algorithmic piece of music.

On the visual side, that involved experimenting with many permutations for the three flocking rules. How heavily should boids align versus separate? If they don't separate enough, the boids all cram together and it feels like just one large mass moving statically. If they separate too much, the clusters loose coherence. Similarly, if they align too much, they move too regimentally, whereas if they aligned too little, they dispersed. It took many tries to get a visually pleasing and balanced simulation.

On the audio side, that involved discovering the right sampling probabilities and vocal rules. How often should outlier boids be sampled? If too much, they dominate the piece and obstruct the overall sonic movements. If too little, we lose liveness. Which boids should play melodies and which should play chords? Do they all have the same loudness? It turns out that the accompaniment and bass needed to be far quieter than the tenor and alto melodic voices. How big should a cluster be to be considered as part of the bass? How small should a cluster be to play the mallets? All these questions were answered through multiple iterations of trial and error.

- [x] Fix issue: when hold keys to spam skills, the skills after duration (effect time), the skill's model, particle, effect still show up. Please help to clean up them completely in this case. Increase default duration of effect of all skills.
- [x] Fix issue: alert message at middle of the screen should on take and stack up 1/5 of the screen, to allow view other, sometime i spawn skills, and too much message show up, it's consume whole height of the screen. Apply quickly remove old messages, if too much new messages coming.
- [x] Enhance: instead of showing damage of enemy by number, show it as particle effect of blooding, base on the damage value, variant the colour. Just show the damage of the skill player casted, not all enemies, and show them in stacked way, max one per 0.3 second.
- [x] Enhance: move the health bar and mana bar to top left corner, in same container with the level, show the icon, hero-portrait of the monk. Show absolute remain/max health, remain/max mana
- [x] Enhance: let the skill cast forward to the near enemies automatically, when cast skill, change the player face to that direction automatically also
- [x] Enhance: add basic attack, we have "fist of thunder" (please refer to fist of thunder in diablo immortal), where hero move quickly like teleport toward an enemy and hit him.
- [x] Enhance: add punch action as base attack of hero, when enemy closed to hero (melee range), auto punch, and has punch animation and has damage,basic damage based on level, items, attribute
- [x] Enhance: allow me to press:
    - "j","k","l",";" equal to "1","2","3","4"
    - "u","i","o" equal to "5","6","7"
- [x] Help me remove touch / click on screen to move
- [x] Add virtual joy stick on bottom-left to allow me to move on touch screen, to replace for a,w,s,d
- [x] On mobile, reduce the opacity of skill, make them smaller and stack them into 2 rows, so that i can see the view and touch skill easily
- [x] Help me force the game in landscape mode, instead of portrait, always landscape
- [x] Enhance: review World.js file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed
    - remove the origin file, integrate with new code base
    - move unrelated methods, logic to proper categorized file
- [x] Enhance: manage memory leak, manage object better to achieve fast render 60 FPS, add memory usage in MB also
- [x] Fix issue: change currentQuality to lower like medium, minimal, but the FPS not increase???, the "high" option is good enough, but the game really blur. I want "medium" is good to play already, help me update the division of threshold better.
- [x] Enhance: auto pause music in background, specially on phone, when i don't play the game
- [x] Fix weird issue: on desktop, all skills on horizon 1 row: cast skill match exactly with the skill, but on phone with 2 rows of skills, cast skill by pressing 1, is skill 2 cast
- [x] Enhance: add GPU acceleration which help to make game much faster, auto reduce complex of threejs, shadow,... to allow have good FPS on medium device, add FPS on top-right of the screen, control the effect, things by target FPS: 60

- [x] Update the service worker cache list by working through the js, assets, css, and images directories. -> generate scripts

- [x] Enhance: Level Up message is impressive, but when multiple level up, should remove the old one quickly, even the current one also only max in 2 seconds, after 2 seconds duration, completely disappear

- [x] ~~Enhance: optimize performance when multiple enemies attack hero, add ParticleManager.js to reduce/batching the bleeding particle each enemy hit to hero~~

- [x] ~~Fix issue: ParticleManager.js has dispose method, is it should be called by PerformanceManager.js, i dont see where this method called~~

- [x] Enhance: review Player.js file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed
    - remove the origin file, integrate with new code base
    - move unrelated methods, logic to proper categorized file


- [x] Enhance: review Skill.js file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed

- [] Currently we have effect as:
    - Wave Strike (Ranged)
    - Cyclone Strike (AoE)
    - Wave of Light (Wave)
    - Fist of Thunder (Teleport)
    - Skills Needing Specific Implementations:
    - Seven-Sided Strike (Multi)
    - Inner Sanctuary (Buff)
    - Mystic Ally (Summon)
    - Exploding Palm (Mark)

    help me rename effect match exactly with the skill name,ex: WaveStrikeEffect, instead of RangedEffect


- [ ] Enhance: we have config player-models.js to control the dynamic adjust of model to stay on-top of the ground. We should not have the switch case on the PlayerModel.js, help me move it to config, each adjustment is static inside each model

- [ ] Enhance: review Enemy.js file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed


- [ ] Enhance: review EnemyManager.js file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed

- [ ] Enhance: review style.css file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed

- [ ] Enhance: review main.js file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed
    - remove the origin file, integrate with new code base
    - move unrelated methods, logic to proper categorized file

- [ ] Enhance: review Game.js file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed
    - remove the origin file, integrate with new code base
    - move unrelated methods, logic to proper categorized file

- [ ] Enhance: review PerformanceManager.js file and optimize it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed
    - remove the origin file, integrate with new code base
    - move unrelated methods, logic to proper categorized file

- [] Enhance: PerformanceManager.js should not render UI directly with DOM manipulation, it should expose the DTO only, let HUDManager handle actual render.


- [ ] Enhance: review HUDManager.js file and optimize it:
    - Remove unused methods.
    - Remove duplicate methods.
    - Define common methods for shared use.
    - Design each container UI to be easily reusable, requiring only a parent `div` and an `id` to mount itself, facilitating standalone rendering later.
    - Define container `div` elements in `index.html` instead of creating them dynamically. Comment the code block to retrieve these existing DOM elements, and add validation to ensure they are defined in `index.html`, alerting and providing a fix if not.
    - Organize code into multiple files for easier maintenance, defining interfaces where necessary.
    - using template style, ex:
    ```js
    return `<div style="color: #4CAF50; font-weight: bold; margin-bottom: 5px;">GPU INFORMATION</div><div><span style="color: #aaa;">Vendor:</span> ${gpuVendor}</div>`
    ```
    - should move methods not related to HUD to proper file, ex: createBleedingEffect

- [ ] Enhance: add config to creaeTeleportEffect, allow to easily say increase size of effect 2 times, than the skill effect 2 times bigger

- [ ] Enhance: when punch automatically, it will be 1,2, 1,2,3, 1,2, 1,2,3,... but at 5 times of this loop, it create thunder punch, which like a ball of thunder energy at top of his punch and effect damage to all enemies close to that, radius default 20, knock back enemies affected

- [ ] Enhance: remove the first terrain, replace with the ground with grey colour, something special to mark that, this is initial place, like our village, add some structures to it. Then only spawn enemies on other dynamic generated terrain.

- [ ] Enhance: add sound to skill has multiple effects if has something special, generate-audio.js is what help me generate audio before.

- [ ] Enhance: draw hero model similar to man monk, provide much complex look for man monk, muscle, head, chest, hand, leg. Add action when moving, add action for legs and hands.

- [ ] Enhance: draw complex model for skeleton monster, close to skeleton, not solid box

- [ ] Enhance: createWaveEffect, add config at top of this method, allow me to control the size of the bell, if i want to bell 2 times bigger then current, i just x2 that bell size number

- [ ] Enhance: new Skill({
                name: 'Mystic Ally',
                description: 'Summon a spirit ally to fight alongside you',
                type: 'summon',
    have you see this skill in diablo immortal, where it create 2 allies as clone of hero, they in blue, help me add that
    then, they can fight (punch action) and random cast skill as hero, they just cast skill with long interval, each time cast is random

- [ ] Enhance: new Skill({
                name: 'Seven-Sided Strike',
                description: 'Rapidly attack multiple enemies',
    you have create multiple cloned hero at random position around the hero to fight, that's good
    however, strike animation and duration short make skill animation unclear
    help me make:
    1. duration longer, 3 seconds at least
    2. allow the cloned hero in flying kick shape (show flying leg)
    3. flying in different direction around the hero
    4. when we have enemies near by the hero, allow some random cloned hero kick to that direction
    5. radius to check for near by enemies default is 50





- [ ] Process all progress log files in the "progress" directory and update details in "functional-requirement":
  - Use `readme.md` as the central file linking everything.
  - Organize `xxx.md` documents into categories like functional and non-functional.
  - Focus on documents, ignoring bug fixes unless they clarify documentation needs.





Dota 1, originally a mod for Warcraft III, featured many heroes that became iconic in the world of MOBA games. Here are ten of the most popular and frequently played heroes from Dota 1:

1. **Invoker** - Known for his complex spell combinations.
2. **Pudge** - Famous for his "Meat Hook" ability.
3. **Mirana** - Popular for her versatile skill set and "Sacred Arrow."
4. **Anti-Mage** - A favorite carry hero with high mobility.
5. **Juggernaut** - Known for his "Blade Fury" and "Omnislash."
6. **Phantom Assassin** - Loved for her critical hits and evasion.
7. **Shadow Fiend** - Popular for his high damage output.
8. **Earthshaker** - Known for his game-changing "Echo Slam."
9. **Crystal Maiden** - A staple support hero with strong crowd control.
10. **Lina** - Known for her powerful nukes and burst damage.

In Dota 1, several heroes are known for their muscular and robust appearances, often embodying strength and power. Here are some of the more muscular heroes from Dota 1:
1. **Axe** - A tanky hero known for his durability and "Berserker's Call."
2. **Sven** - Known for his strength and powerful "God's Strength" ability.
3. **Tiny** - Starts small but grows larger and more muscular as he levels up his "Grow" ability.
4. **Kunkka** - A strong hero with a muscular build, known for his "Ghostship" and "Tidebringer."
5. **Tidehunter** - A large, muscular sea creature known for his "Ravage" ability.
6. **Beastmaster** - A rugged hero with a muscular build, known for his "Primal Roar."
7. **Centaur Warrunner** - Known for his massive size and strength, with abilities like "Stampede."
8. **Doom** - A demonic hero with a muscular frame, known for his "Doom" ability.
9. **Dragon Knight** - A strong, armored hero who transforms into a dragon.
10. **Lycan** - Known for his transformation into a powerful wolf, showcasing his muscular prowess.

Here are some well-known characters from various media who are famous for using weapons:

1. **Link** (The Legend of Zelda) - Known for wielding the Master Sword and a variety of other weapons.
2. **Cloud Strife** (Final Fantasy VII) - Famous for his large Buster Sword.
3. **Kratos** (God of War) - Known for his Blades of Chaos and other powerful weapons.
4. **Lara Croft** (Tomb Raider) - Often seen with dual pistols and a bow.
5. **Geralt of Rivia** (The Witcher) - Uses swords, both steel and silver, for different types of enemies.
6. **Master Chief** (Halo) - Known for using a variety of futuristic firearms and melee weapons.
7. **Samus Aran** (Metroid) - Equipped with an arm cannon and various other weapons.
8. **Dante** (Devil May Cry) - Uses a combination of swords and guns.
9. **Ezio Auditore** (Assassin's Creed) - Known for his hidden blades and a variety of other weapons.
10. **Solid Snake** (Metal Gear Solid) - Utilizes a range of firearms and stealth equipment.

Here are some general names for characters or roles that typically use weapons, especially in a medieval or fantasy context:

1. **Knight** - Often depicted with swords, shields, and armor.
2. **Archer** - Uses bows and arrows.
3. **Swordsman** - Specializes in sword fighting.
4. **Spearman** - Wields a spear or lance.
5. **Axeman** - Known for using axes.
6. **Paladin** - A holy knight, often using swords and shields.
7. **Barbarian** - Typically uses heavy weapons like axes or clubs.
8. **Mercenary** - A soldier for hire, using various weapons.
9. **Samurai** - A Japanese warrior known for using katanas.
10. **Viking** - Often depicted with axes and shields.
11. **Ranger** - Skilled with bows and often uses dual weapons.
12. **Berserker** - A warrior who fights with intense fury, often using axes or swords.
13. **Musketeer** - Uses early firearms and swords.
14. **Gladiator** - A combatant in ancient arenas, using a variety of weapons.
15. **Cavalier** - A mounted soldier, often using lances and swords.


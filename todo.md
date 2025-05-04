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
- [x] Enhance: manage memory leak, manage object better to achieve fast render 60 FPS, add memory usage in MB also
- [x] Fix issue: change currentQuality to lower like medium, minimal, but the FPS not increase???, the "high" option is good enough, but the game really blur. I want "medium" is good to play already, help me update the division of threshold better.
- [] Enhance: auto pause music in background, specially on phone, when i don't play the game
- [] Fix weird issue: on desktop, all skills on horizon 1 row: cast skill match exactly with the skill, but on phone with 2 rows of skills, cast skill by pressing 1, is skill 2 cast

- [ ] Enhance: review Player.js file and optimise it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed
    - remove the origin file, integrate with new code base


- [ ] Enhance: review Skill.js file and optimise it:
    - remove unused method
    - remove duplicate methods
    - define common methods to be shared
    - separate into multiple files for easier to maintain, define interface when needed


- [ ] Enhance: review UIManager.js file and optimise it:
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

- [ ] Enhance: review Enemy.js file and optimise it:
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

    


- [x] Update the service worker cache list by working through the js, assets, css, and images directories. -> generate scripts

- [ ] Enhance: add config to creaeTeleportEffect, allow to easily say increase size of effect 2 times, than the skill effect 2 times bigger
- [ ] Enhance: when punch automatically, it will be 1,2, 1,2,3, 1,2, 1,2,3,... but at 5 times of this loop, it create heavy punch, which like a ball of thunder energy at top of his punch and effect damage to all enemies close to that
- [ ] Enhance: remove the first terrain, replace with the ground with grey colour, something special to mark that, this is initial place, like our village, add some structures to it. Then only spawn enemies on other dynamic generated terrain.
- [ ] Enhance: help me generate audio effect for each skill when casted, when in duration effect if has something special need to added. generate-audio.js is what help me generate audio before.
- [ ] Enhance: draw hero model similar to man monk, provide much complex look for man monk, muscle, head, chest, hand, leg. Add action when moving, add action for legs and hands.
- [ ] Enhance: draw complex model for skeleton monster, close to skeleton, not solid box
- [ ] Enhance: createWaveEffect, add config at top of this method, allow me to control the size of the bell, if i want to bell 2 times bigger then current, i just x2 that bell size number
- [x] Enhance: add GPU acceleration which help to make game much faster, auto reduce complex of threejs, shadow,... to allow have good FPS on medium device, add FPS on top-right of the screen, control the effect, things by target FPS: 60


- [] Enhance: PerformanceManager.js should not render UI directly with DOM manipulation, it should expose the DTO only, let UIManager handle actual render.



- [ ] Process all progress log files in the "progress" directory and update details in "functional-requirement":
  - Use `readme.md` as the central file linking everything.
  - Organize `xxx.md` documents into categories like functional and non-functional.
  - Focus on documents, ignoring bug fixes unless they clarify documentation needs.









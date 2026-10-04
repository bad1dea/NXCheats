# NXCheats



<p align="center">
  <imgsrc="https://github.com/bad1dea/NXCheats/assets/10354814/467a59df-2b33-4f3b-80b4-3ba5292420d6"
       alt="NXCheats"
       width="350">
</p>

<p>
  <img
    src="https://github.com/user-attachments/assets/4331184e-10b5-48f9-8360-0d412747c583"
    width="250"
    align="left"
    alt="NXCheats"
  />
<br><br><br>

Cheats for Nintendo Switch games, built for
**Atmosphere on real hardware**.

<br>

Each title has its own directory holding the SD-card layout,
so installing a set is unzipping it onto the card.

<br>

A cheat file is tied to one build ID: the filename is that
build ID, and a set from another version will not load.

<br clear="all" />

<br> 
Older sets, in the previous per-emulator layout, are under [`_old`](./_old).

## Games with two files

Some games come with two files, a cheat file (.txt) and a patch (.ips). Both
files have to be installed or the cheats will not work. Copy the whole
atmosphere folder to the root of your SD card.

```
atmosphere/contents/<TID>/cheats/<BID>.txt
atmosphere/exefs_patches/nxcheats/<ID>.ips
```

This is to help bypass the limits of CheatVM. Cheats turn on and off without
having to restore code, and a lot more code caves can be put in.

More on how it works, with examples: [TWO-FILES.md](./TWO-FILES.md)

`<BID>.txt.noips` is the full cheat file without the patch, with all the code
in it, for anyone who wants to port or edit the cheats. Atmosphere does not
load it.

## Titles

| Game | Title id | Cheats |
|---|---|---:|
| [Castlevania Belmont's Curse Demo](./0100D1D027E96000%20Castlevania%20Belmont's%20Curse%20Demo) | `0100D1D027E96000` | 20 |
| [Diablo® II: Resurrected™](./0100726014352000%20Diablo®%20II:%20Resurrected™) | `0100726014352000` | 91 |
| [Diablo III: Eternal Collection](./01001B300B9BE000%20Diablo%20III:%20Eternal%20Collection) | `01001B300B9BE000` | 70 |
| [FINAL FANTASY](./01000EA014150000%20FINAL%20FANTASY) | `01000EA014150000` | 59 |
| [FINAL FANTASY VI](./0100AA001415E000%20FINAL%20FANTASY%20VI) | `0100AA001415E000` | 81 |
| [Garfield - Escape From Monday](./01000EB0276F2000%20Garfield%20-%20Escape%20From%20Monday) | `01000EB0276F2000` | 22 |
| [Hello Kitty Island Adventure](./010027901C89C000%20Hello%20Kitty%20Island%20Adventure) | `010027901C89C000` | 12 |
| [High On Life](./0100C1101EE5A000%20High%20On%20Life) | `0100C1101EE5A000` | 27 |
| [Hogwarts Legacy](./0100F7E00C70E000%20Hogwarts%20Legacy) | `0100F7E00C70E000` | 65 |
| [Kalanoro](./0100EB60202C8000%20Kalanoro) | `0100EB60202C8000` | 24 |
| [Minecraft Dungeons II](./0100A7C01B792000%20Minecraft%20Dungeons%20II) | `0100A7C01B792000` | 99 |
| [No Man's Sky](./0100853015E86000%20No%20Man's%20Sky) | `0100853015E86000` | 36 |
| [Octopath Traveler™](./010057D006492000%20Octopath%20Traveler™) | `010057D006492000` | 15 |
| [OCTOPATH TRAVELER 0](./01005270232F2000%20OCTOPATH%20TRAVELER%200) | `01005270232F2000` | 57 |
| [OCTOPATH TRAVELER II](./0100A3501946E000%20OCTOPATH%20TRAVELER%20II) | `0100A3501946E000` | 35 |
| [The Outer Worlds](./0100626011656000%20The%20Outer%20Worlds) | `0100626011656000` | 33 |
| [Splatoon™ 3](./0100C2500FC20000%20Splatoon™%203) | `0100C2500FC20000` | 28 |
| [Super Mario RPG™](./0100BC0018138000%20Super%20Mario%20RPG™) | `0100BC0018138000` | 78 |
| [The Witcher 3: Wild Hunt - Complete Edition](./01003D100E9C6000%20The%20Witcher%203:%20Wild%20Hunt%20-%20Complete%20Edition) | `01003D100E9C6000` | 35 |

**19 titles, 887 cheats.**

## Support

Everything here is free and stays free. If you want to leave a tip anyway:
[ko-fi.com/bad1dea](https://ko-fi.com/bad1dea).

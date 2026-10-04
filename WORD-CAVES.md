# Word gated code caves

This is how I make cheats turn on and off without a Restore Code, in a
normal cheat file. The two file sets ([TWO-FILES.md](./TWO-FILES.md)) use the
same thing, just with the caves moved into a patch.

The comments in the code blocks are only there so you can follow along. A real
cheat file can't have comments in it.

## The problem

A code cave is my own code sitting in empty space in the game. A hook (one
`B` instruction) sends the game into it.

When you untick a cheat, Atmosphere just stops running it. It doesn't undo
anything. The hook still jumps into the cave and the cave keeps doing its
thing. That's why old sets have a Restore Code: you tick it after everything
else is off and it writes the original code back.

A few things I can count on:

* Atmosphere runs the master code first, then every ticked cheat, about 12
  times a second
* you can't untick the master code
* registers get cleared every time, so only the game's memory keeps anything
  between runs

So I keep the on/off switch in the game's memory.

## The idea

Three parts:

1. A word table: a few 4 byte words in the empty space next to the caves, one
   word per cheat. 0 means off.
2. The master code sets the whole table to 0 every time it runs.
3. Every cave checks its word. It always runs the game's original
   instruction, and only does the cheat part when its word isn't 0.

A ticked cheat writes its cave, its hook, then sets its word to 1. It does
that every run, right after the master cleared it, so the cave always sees 1.
Untick it and the master's 0 is the last thing written. The cave sees 0 and
the game runs like normal. The hook and cave stay in memory, they just don't
do anything.

## Reading the codes

```
080E0000 00FFF100 35000049 18FFF809
│││      │        │        └ value, the low 4 bytes (goes to 00FFF100)
│││      │        └ value, the high 4 bytes (goes to 00FFF104)
│││      └ address, from the start of main
││└ E: offset register, never set, so it stays 0
│└ 0: main
└ 08: write 8 bytes (04 writes 4)
```

I write code 8 bytes at a time, so each line holds two instructions, the
higher address first.

## Made up example 1: one switch

Infinite Ammo. The game does `SUB W8, W8, #1` at main+0x123450 to take a
bullet away. My words are at main+0xFFF000 and the cave at main+0xFFF100.

### The usual way

```
[Infinite Ammo]
040E0000 00123450 D503201F      ; NOP over the subtract

[Restore Code]
040E0000 00123450 51000508      ; SUB W8, W8, #1 back
```

Untick Infinite Ammo and the NOP stays. Only Restore Code takes it out, and it
puts back every patch in the file at once.

### With a word

The cave:

```
main+0xFFF100:  LDR  W9, main+0xFFF000   ; 18FFF809  read the ammo word
main+0xFFF104:  CBNZ W9, main+0xFFF10C   ; 35000049  word on: skip the subtract
main+0xFFF108:  SUB  W8, W8, #1          ; 51000508  word off: what the game did
main+0xFFF10C:  B    main+0x123454       ; 17C490D2  back to the game
```

The cheat file:

```
{Master Code}
080E0000 00FFF000 00000000 00000000   ; clear words 0 and 1
080E0000 00FFF008 00000000 00000000   ; clear words 2 and 3

[Infinite Ammo]
080E0000 00FFF108 17C490D2 51000508   ; cave, second half
080E0000 00FFF100 35000049 18FFF809   ; cave, first half
040E0000 00123450 143B6F2C            ; hook: B main+0xFFF100
040E0000 00FFF000 00000001            ; ammo word = 1
```

Order matters. Write the cave before the hook, so the game never jumps into
half written code, and set the word last.

## Made up example 2: a ladder

Gold x2 / x5 / x10. The game loads the gold amount with `LDR W0, [X0]` at
main+0x222220. One cave reads the multiplier from a word, so all the rungs
share the cave and only write a different number.

The cave:

```
main+0xFFF200:  LDR  W0, [X0]            ; B9400000  the original instruction
main+0xFFF204:  LDR  W9, main+0xFFF004   ; 18FFF009  the multiplier word
main+0xFFF208:  CBZ  W9, main+0xFFF210   ; 34000049  0: leave the gold alone
main+0xFFF20C:  MUL  W0, W0, W9          ; 1B097C00  gold x the word
main+0xFFF210:  B    main+0x222224       ; 17C88C05  back to the game
```

The cheat file:

```
[Gold x2]
080E0000 00FFF208 1B097C00 34000049   ; cave
080E0000 00FFF200 18FFF009 B9400000   ; cave
040E0000 00FFF210 17C88C05            ; cave, last instruction
040E0000 00222220 143773F8            ; hook
040E0000 00FFF004 00000002            ; multiplier = 2

[Gold x5]
...                                   ; the same four cave and hook lines
040E0000 00FFF004 00000005            ; multiplier = 5

[Gold x10]
...
040E0000 00FFF004 0000000A            ; multiplier = 10
```

Tick one rung at a time. If you tick two, the one lower in the file wins,
because it writes the word last.

## Made up example 3: a float multiplier

Move Speed. The game loads a float with `LDR S0, [X0, #0x50]` at
main+0x333330. The word holds the float itself: 1.5 is `3FC00000`, 2.0 is
`40000000`, and 0 is off.

```
main+0xFFF300:  LDR  S0, [X0, #0x50]     ; BD405000  the original instruction
main+0xFFF304:  LDR  W9, main+0xFFF008   ; 18FFE829  the speed word
main+0xFFF308:  CBZ  W9, main+0xFFF314   ; 34000069  0: normal speed
main+0xFFF30C:  FMOV S1, W9              ; 1E270121  word as a float
main+0xFFF310:  FMUL S0, S0, S1          ; 1E210800  speed x the float
main+0xFFF314:  B    main+0x333334       ; 17CCD008  back to the game
```

```
[Move Speed x1.5]
080E0000 00FFF310 17CCD008 1E210800   ; cave
080E0000 00FFF308 1E270121 34000069
080E0000 00FFF300 18FFE829 BD405000
040E0000 00333330 14332FF4            ; hook
040E0000 00FFF008 3FC00000            ; 1.5

[Move Speed x2]
...
040E0000 00FFF008 40000000            ; 2.0
```

This works because the cave changes what the game loads. If a cheat writes a
number straight into the game (speed = 2.0 in the player's data), that number
stays after you untick it, and you need an x1 entry to put the default back.

## Real example: Diablo III gold drops

`01001B300B9BE000 Diablo III: Eternal Collection`, Gold drops x2 / x5 / x10.
I hook main+0x890CA8, where a gold pile reads its amount with
`LDR W0, [X19, #0xC]`.

```
[♯10a Gold drops x2]
080E0000 00C72DDC 17F077B3 B9000E60   ; cave
080E0000 00C72DD4 1B097C00 34000069
080E0000 00C72DCC B9400129 913EE129
080E0000 00C72DC4 90000009 B9400E60
040E0000 00890CA8 140F8847            ; hook
040E0000 00C72FB8 00000002            ; multiplier = 2

[♯10b Gold drops x5]
...
040E0000 00C72FB8 00000005            ; multiplier = 5
```

The cave:

```
LDR  W0, [X19, #0xC]     ; the original instruction: the pile's amount
ADRP X9, <word page>     ; address of the gold word
ADD  X9, X9, #<offset>
LDR  W9, [X9]            ; the multiplier
CBZ  W9, out             ; 0: leave it alone
MUL  W0, W0, W9          ; amount x the multiplier
STR  W0, [X19, #0xC]     ; stored back, so the pile and the gold you get agree
out:
B    back
```

The master code clears the words from 00C72FB8 on:

```
{Master Code (includes share functions)}
...
080E0000 00C72FB8 00000000 00000000
080E0000 00C72FC0 00000000 00000000
...
```

## Real example: The Outer Worlds, four cheats on one hook

`0100626011656000 The Outer Worlds`. Infinite Health, Companions Infinite
Health, One-Punch Man and Damage x2 / x5 / x10 all hook the same spot:
`LDR S1, [X21, #0x1C]` at main+0x12E82D4, where the game loads the damage
something is about to take. One cave, four words. Each cheat writes the same
cave and its own word, so you can have any of them on together.

```
LDR  S1, [X21, #0x1C]        ; the original instruction: incoming damage
...                          ; is X19 the player's health component?
B.EQ player
...                          ; is it one of the player's companions?
B.EQ companion
...                          ; otherwise it is something the player hit
enemy:
LDR  W10, [X9, #ohk]         ; One-Punch Man word
CBZ  W10, factor
...                          ; S1 = a huge number
B    out
factor:
LDR  W10, [X9, #dmg_mul]     ; Damage word, holds the multiplier as a float
CBZ  W10, out
FMOV S16, W10
FMUL S1, S1, S16             ; damage x the multiplier
B    out
companion:
LDR  W10, [X9, #companions]  ; Companions Infinite Health word
CBZ  W10, out
B    zero
player:
LDR  W10, [X9, #health]      ; Infinite Health word
CBZ  W10, out
zero:
FMOV S1, WZR                 ; damage = 0
out:
B    back
```

In the cheat file each one is the same 24 line cave, the hook, and its word:

```
[♯ 1. Infinite Health]
080E0000 04571FB8 1735D8C7 1E2703E1   ; cave
...                                   ; 23 more cave lines
040E0000 012E82D4 14CA270B            ; hook
040E0000 04571FC0 00000001            ; health word

[♯ 5. One-Punch Man (OHK)]
...                                   ; the same cave and hook
040E0000 04571FC8 00000001            ; ohk word
```

## Real example: Octopath Traveler 0, caves outside main

`01005270232F2000 OCTOPATH TRAVELER 0`. Main only had about 1.6 KB of empty
space and I filled it, so I put the caves in the empty space at the end of
the game's `sdk` module. Every cave write sits inside two checks of the bytes
that should be there, so if your console's layout is different it just writes
nothing.

```
[Infinite HP]
14050000 0985C6B8 91232210            ; check: these bytes must be here
14050000 0985C6BC D61F0220            ; check: and these
080E0000 0985CFF8 ...                 ; the cave, written first
080E0000 0985CFF0 ...
080E0000 0985CFE8 ...
080E0000 0985CFE0 ...
040E0000 0985CFDC 1A88B294            ; last cave word: B back to the hook
040E0000 0382C5E4 1580C27E            ; the hook: B to the cave
20000000                              ; end of the checks
20000000
040E0000 0526DF90 00000001            ; hp word, outside the checks
```

The cave:

```
CSEL W20, W20, W8, LT        ; the original instruction
CBNZ W22, out                ; enemy flag set: leave it alone
ADRP X9, <word page>
ADD  X9, X9, #<offset>
LDR  W10, [X9, #<hp word>]
CBZ  W10, out                ; word is 0: behave like the game
MOV  W20, W8                 ; HP = max
B    back
out:
B    back
```

## The same thing with two files

Everything above writes the cave and hook from the cheat file every run. That's
what eats up CheatVM: every line of cave is a line in the cheat, and a ladder
writes the whole cave again for each rung.

With two files I move the caves and hooks into the patch, and Atmosphere puts
them in once when the game starts. The cheat file only keeps the master code
and the word lines:

```
{Master Code}
080E0000 00FFF000 00000000 00000000

[Infinite Ammo]
040E0000 00FFF000 00000001

[Gold x2]
040E0000 00FFF004 00000002
```

The caves work the same way. See [TWO-FILES.md](./TWO-FILES.md).

## Rules for writing a cave

* Always run the original instruction. The hook took its place, so the cave
  has to do it. If it's a conditional branch, keep both ways out of it.
* Only use registers that are free at the hook. Read the function around it
  first. I use W9, W10 and X16 a lot, but only after checking.
* Keep the flags. If the code after the hook reads NZCV, don't change it, or
  set it back.
* A cave can't write to its own words. The empty space is in the game's code
  and the game can't write there, so a store from the cave crashes it.
  Atmosphere can write there. If the cave has to keep something for itself
  (a counter), it needs memory the game can write.
* Reach the words with ADRP + ADD. ADR only reaches 1 MB.
* Keep the cave within 128 MB of the hook. A hook is one `B`.
* Write the cave before the hook, and the word last.

## Limits

* A cheat that writes a value into the game (a speed, a stat) keeps that
  value after you untick it. Either use a cave that changes what the game
  loads, or add an x1 entry.
* After you untick, the hook and cave stay in memory and just run the original
  instruction.
* Every run the master clears a word a moment before the cheat sets it again.
  If the game reads it right then, the cheat is off for that one read. For
  health, drops and multipliers you won't notice.
* CheatVM allows 256 lines per cheat, 1024 for everything ticked at once, 128
  cheats and 64 KB per file. With the caves in the cheat file a ladder counts
  its whole cave once per rung. That's how Octopath Traveler 0 went past 1024
  with everything ticked, so it ships with everything off. Two file sets don't
  have this problem.

## Checking it on the console

```
tick the cheat, read its word         1
untick it, wait half a second         0
tick it again                         1
```

I do that before I say a cheat turns off when you untick it.

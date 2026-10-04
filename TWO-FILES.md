# Why some games have two files

Some games come with two files:

| File | Where it goes | What it does |
|---|---|---|
| `<BID>.txt` | `atmosphere/contents/<TID>/cheats/` | The cheat menu. Each cheat only turns a word on or off. |
| `<ID>.ips` | `atmosphere/exefs_patches/nxcheats/` | The code caves. Atmosphere puts them in when the game starts. |
| `<BID>.txt.noips` | `atmosphere/contents/<TID>/cheats/` | The full cheat file the old way, for porting or editing. Atmosphere does not load it. |

**Both files have to be installed.** The cheat file does nothing without the
patch, and the patch does nothing without the cheat file. Copy the whole
atmosphere folder to the root of your SD card.

## Why

This is to help bypass the limits of CheatVM. A cheat can only be so long, the
cheat file has to write every code cave itself every time it runs, and turning
a cheat off needs a Restore Code to put the game's code back.

With two files I put the code caves in the patch. Every cave checks its own
word first, and when the word is 0 the game runs like normal. The cheat file
only sets those words. The master code sets them all back to 0 every time it
runs, so you untick a cheat and it's off. No Restore Code, a lot more room for
code caves, and a much smaller cheat file.

How the word gated caves work, also in a normal cheat file, with more
examples: [WORD-CAVES.md](./WORD-CAVES.md)

The patch and the cheat file are both made for one version of the game. After
an update neither one loads until I put out a new set.

## How it was done before, and how it is done now

The comments below are only there so you can follow along. A real cheat file
can't have comments in it.

### Example 1: a patch that needs a Restore Code (made up)

A game takes ammo away with one instruction. The usual way is to write over
it, and have a second entry that writes the original back.

**Before**, one file:

```
[Infinite Ammo]
04000000 00123450 D503201F      ; write NOP over "SUB W8, W8, #1"

[Restore Code]
04000000 00123450 51000508      ; write "SUB W8, W8, #1" back
```

Unticking Infinite Ammo doesn't turn it off. You have to tick Restore Code, and
that puts back every patch in the file at once.

**Now**, two files:

```
; in the .ips (put in when the game starts)
main+0x123450:  B    cave                  ; jump to the cave instead
cave:           LDR  W9, word_ammo          ; read this cheat's word
                CBNZ W9, skip               ; word on: skip the subtract
                SUB  W8, W8, #1             ; word off: what the game did
skip:           B    main+0x123454          ; back to the game
```

```
{Master Code}
04000000 00FFF000 00000000      ; every word back to 0, every time it runs

[Infinite Ammo]
04000000 00FFF000 00000001      ; word_ammo = 1 while ticked
```

Untick it and the master sets the word back to 0. The cave sees 0 and takes
the ammo like normal.

### Example 2: a multiplier with a few rungs (made up)

Gold x2 / x5 / x10. The usual way gives each rung its own copy of the cave with
a different number in it, and every rung writes it again.

**Before**, one file:

```
[Gold x2]
08000000 00FFF100 52800049 1B097C00   ; cave: MOV W9, #2 / MUL W0, W0, W9
08000000 00FFF108 14000000 00000000   ; cave: B back
04000000 00222220 14000000            ; hook: B cave

[Gold x5]
08000000 00FFF100 528000A9 1B097C00   ; same cave, MOV W9, #5
...                                   ; and the rest again

[Restore Code]
04000000 00222220 B9400000            ; original instruction back
```

**Now**, one cave in the patch reads the number from a word:

```
; in the .ips
main+0x222220:  B    cave
cave:           LDR  W9, word_gold          ; the multiplier, 0 when off
                CBZ  W9, out
                MUL  W0, W0, W9
out:            LDR  W0, [X0]               ; the original instruction
                B    main+0x222224
```

```
[Gold x2]
04000000 00FFF004 00000002

[Gold x5]
04000000 00FFF004 00000005

[Gold x10]
04000000 00FFF004 0000000A
```

## Real examples: The Outer Worlds 1.0.5

These are from `0100626011656000 The Outer Worlds`. My old file was already
word gated, so it had no Restore Code, but every cheat still had to write its
whole cave.

### Infinite Health

**Before**, 26 lines, written every time the cheat runs:

```
[♯ 1. Infinite Health]
080E0000 04571FB8 1735D8C7 1E2703E1   ; the cave, 8 bytes at a time
080E0000 04571FB0 3400004A B940012A
080E0000 04571FA8 14000004 1E300821
...                                   ; 20 more lines of cave
080E0000 04571F00 90000009 BD401EA1
040E0000 012E82D4 14CA270B            ; the hook: B to the cave
040E0000 04571FC0 00000001            ; the word
```

**Now**, 1 line. The cave and the hook are in the patch:

```
[♯ 1. Infinite Health]
040E0000 04571FC0 00000001            ; the word
```

Companions Infinite Health and One-Punch Man (OHK) used the same 24 line cave
and each wrote it again. Now they're 1 line each too.

### Exp x2 / x5 / x10

**Before**:

```
[♯15a Exp x2]
080E0000 04571C8C 173F3322 7100043F   ; the cave
080E0000 04571C84 1B0A7C21 3400004A
080E0000 04571C7C B940152A 913F0129
040E0000 04571C78 90000009
040E0000 0153E914 14C0CCD9            ; the hook
040E0000 04571FD4 00000002            ; the multiplier
```

and the same five lines again in x5 and x10.

**Now**:

```
[♯15a Exp x2]
040E0000 04571FD4 00000002

[♯15b Exp x5]
040E0000 04571FD4 00000005

[♯15c Exp x10]
040E0000 04571FD4 0000000A
```

The cave in the patch, at the instruction where the game adds Exp:

```
main+0x153E914:  B    cave
cave:            ADRP X9, words
                 LDR  W10, [X9, #xp_mul]    ; the multiplier word
                 CBZ  W10, out              ; 0: leave Exp alone
                 MUL  W1, W1, W10           ; Exp x the multiplier
out:             CMP  W1, #1                ; the instruction the hook replaced
                 B    main+0x153E918        ; back to the game
```

### The whole file

| | Before | Now |
|---|---:|---:|
| Cheat file | 507 lines, 15,278 bytes | 146 lines, 2,786 bytes |
| Patch | none | 1,321 bytes |
| Restore Code | none (word gated) | none |

The master code is the same in both. It sets every word back to 0, so anything
you untick turns off.

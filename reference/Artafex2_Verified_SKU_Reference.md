# Artafex 2 — Verified SKU Reference

**Sources:** DMF A/V Product Guide 2025 (catalog ordering pages) + Artafex 2 spec sheets (Round/Square × Downlight/Adjustable, standard + PhaseX, + 2" Retrofit). All transcribed/verified, not inferred.

## Module builder ✅
`ART2[D|A]` + lumens + `T` + cct + beam + dimming **(no finish code — differs from A4)**

| Segment | Codes |
|---|---|
| Product | `ART2D` Downlight · `ART2A` Adjustable |
| Lumens | `07` 750 · `10` 1000 · `12` 1250 · `15` 1500 lm (Adjustable: 07/10 only) |
| CRI | `T` True Spectrum® |
| CCT | `27` 2700K · `30` 3000K · `35` 3500K · `40` 4000K · `3W` Warm Dim · `T1` Tunable White |
| Beam (Downlight) | `NS` Narrow Spot 20° · `SP` Spot 30° · `FL` Flood 40° · `WF` Wide Flood 50° · `LS` Linear Spread 50×30 |
| Beam (Adjustable) | above + `NH`/`SH`/`FH`/`WH` Hexcell Louver variants |
| Dimming | `T` TRIAC/ELV · `D` DALI-2 · `X` PhaseX |

Verified examples: `ART2D07T27NST`, `ART2A07T27NST`, `ART2D10TT1SPX` (PhaseX). Wattage: 750=9.5W, 1000=12.5W (14.5W digital), 1250=14.3W, 1500=14.3W.

## Housing builder ✅
`X2` + install + shape(`R`/`S`). **Remodel resolves by dimming:** `RM` (TRIAC/ELV) vs `RD` (DALI/PhaseX digital).

| Install | Round | Square |
|---|---|---|
| New Construction | X2NCR | X2NCS |
| Chicago Plenum | X2CPR | X2CPS |
| Remodel (TRIAC) | X2RMR | X2RMS |
| Remodel (Digital) | X2RDR | X2RDS |

## Trim builder ✅
`X2T` + shape(`R`/`S`) + module(`D`/`A`) + style + finish + option.
- Style: `S` Standard · `W` Wall Wash · `P` Pinhole · `H` Hyperbolic (round downlight only)
- Finish: `WH`/`BK`/`BZ`/`CW`/`CC`; Premium metalized `BR`/`CO`/`GR` (Standard trims only)
- Option: `MF` Micro Flange · `FL` Flangeless · *(blank)* Flanged (Hyperbolic only) · decorative `DO` open / `DH` hyperbolic (round) / `DF` float (square)

Verified: `X2TRDSWHMF` (Round Downlight Std White Micro-Flange), `X2TRDSWHFL`, `X2TRDHWH` (Hyperbolic flanged), `X2TRDSWHDO` (Decorative Open), `X2TRASWHMF` (Adjustable), `X2TSDSWHMF` (Square).

## Accessories ✅
Round: `X2KRMUD` Flangeless Mud Kit · `X2KRRETRO6` (6→2) · `X2KRRETRO45` (4"/5"→2) · `X2KRWOOD` Wood Kit · `X2KRWOODXL` Wood Ext · `X2KRTEMPLATE` Router Template · `X2CREXT` Extension Collar.
Square: `X2KSMUD`, `X2KSRETRO6`, `X2KSWOOD`, `X2KSTEMPLATE`.

## Rules (catalog footnotes) ✅
- **Flangeless (`FL`) → Flangeless Mud Kit or Wood Kit required** (auto-add `X2KRMUD`/`X2KSMUD`).
- **Micro-Flange trims include a Precision Lock Collar** (bundled).
- **Flangeless / decorative trims + mud kit are NOT compatible with Remodel housing** (tool blocks these pairings).
- Adjustable caps at 1000 lm; Hexcell beams are Adjustable-only.
- Premium metalized finishes (Brass/Copper/Graphite) on Standard trims only.
- Downlight UL Wet-rated; Adjustable UL Damp-rated.

## Retrofit (existing fixture) ✅
Reuses the standard `X2` round/square trims (not a separate line). Assembly = module (`ART2D`/`ART2A`) + `X2` trim + conversion kit (`X2KRRETRO6` 6→2, `X2KRRETRO45` 4"/5"→2, `X2KSRETRO6` square 6→2).

## Bundled spec sheets (in `specs/`)
A2_Round_Downlight, A2_Square_Downlight, A2_Round_Adjustable, A2_Square_Adjustable, PhaseX ×4, A2_Retrofit.

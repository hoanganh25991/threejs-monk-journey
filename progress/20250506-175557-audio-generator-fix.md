# Audio Generator Fix

## Issue
The audio generation script was failing with the following error when trying to generate `ally_summon.mp3`:

```
Error generating ally_summon.mp3: Error: Command failed: sox -m "/Users/anhle/work-station/diablo-immortal/scripts/temp/temp_ally_summon.mp3_0.wav" "/Users/anhle/work-station/diablo-immortal/scripts/temp/temp_ally_summon.mp3_1.wav" "/Users/anhle/work-station/diablo-immortal/scripts/temp/temp_ally_summon.mp3_2.wav" "/Users/anhle/work-station/diablo-immortal/scripts/assets/audio/ally_summon.mp3" reverb 50 50 100 100 0 15 echo 0.8 0.9 120 0.3 chorus 0.7 0.9 55 0.4 0.25 2 -t
sox FAIL reverb: parameter `wet_gain_dB' must be between -10 and 10
sox FAIL reverb: usage: [-w|--wet-only] [reverberance (50%) [HF-damping (50%) [room-scale (100%) [stereo-depth (100%) [pre-delay (0ms) [wet-gain (0dB)]]]]]]
```

## Root Cause
The error occurred because the `wet_gain_dB` parameter in the reverb effect was set to 15, which is outside the allowed range of -10 to 10 as specified by SoX.

## Solution
Modified the `addEffects` function in `scripts/generate-audio.js` to use a valid value for the `wet_gain_dB` parameter:

```javascript
if (params.reverb) {
    command += ' reverb 50 50 100 100 0 5'; // More realistic reverb settings (wet_gain_dB must be between -10 and 10)
}
```

Changed the value from 15 to 5, which is within the allowed range.

## Verification
After making the change, the script ran successfully and generated all audio files, including `ally_summon.mp3`.

## Additional Notes
The SoX (Sound eXchange) command-line utility has specific parameter ranges for its effects. When using the reverb effect, the `wet_gain_dB` parameter must be between -10 and 10 dB. This parameter controls the level of the reverberated sound in the mix.
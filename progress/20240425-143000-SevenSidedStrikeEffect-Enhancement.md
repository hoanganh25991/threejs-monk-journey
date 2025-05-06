# Seven-Sided Strike Effect Enhancement

## Summary
Enhanced the Seven-Sided Strike skill effect to make the connection lines appear much faster and more visibly. The changes improve the visual feedback and make the skill feel more responsive and impactful.

## Changes Made

### 1. Enhanced Line Visibility
- Replaced simple lines with tube geometry for thicker, more visible connecting lines
- Used MeshStandardMaterial with emissive properties for a glowing effect
- Increased line thickness from thin lines to 0.15 radius tubes
- Added more segments (8 instead of 1) for smoother tube appearance

### 2. Improved Line Animation Speed
- Reduced line lifetime by 50% (maxAge: strikeDuration * 0.5)
- Made lines appear at full opacity immediately instead of fading in
- Maintained full opacity for 80% of the line's lifetime
- Added quick fade-out only in the final 20% of the line's lifetime

### 3. Added Dynamic Visual Effects
- Implemented pulsing emissive intensity that changes at 20Hz
- Added subtle scale pulsing for more dynamic appearance
- Increased emissive intensity to 2.0 for stronger glow
- Added scale pulsing effect to make lines more noticeable

## Technical Implementation
- Replaced LineBasicMaterial with MeshStandardMaterial for better visual quality
- Used TubeGeometry instead of BufferGeometry for more substantial lines
- Implemented optimized fade-out logic to maintain high visibility
- Added dynamic pulsing effects through emissive intensity modulation

## Result
The Seven-Sided Strike skill now has much faster and more visible connection lines, making the skill feel more responsive and visually impressive. The lines appear instantly at full opacity and maintain high visibility throughout most of their lifetime.
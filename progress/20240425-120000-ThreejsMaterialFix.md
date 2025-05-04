# Three.js Material Property Fix

## Issue
The application was showing the following warnings in the console:
```
three.module.js:9240 THREE.Material: 'emissive' is not a property of THREE.MeshBasicMaterial.
THREE.Material: 'emissiveIntensity' is not a property of THREE.MeshBasicMaterial.
```

## Root Cause
In the Enemy.js file, there were three instances where `emissive` and `emissiveIntensity` properties were being used with `MeshBasicMaterial`. However, these properties are only available for materials that support emissive properties, such as `MeshStandardMaterial` or `MeshPhongMaterial`.

## Solution
Changed all instances of `MeshBasicMaterial` that were using emissive properties to `MeshStandardMaterial`, which properly supports these properties:

1. Changed the material for glowing eyes at line 1542
2. Changed the material for glowing cracks at line 1630
3. Changed the material for another set of glowing eyes at line 1719

## Technical Details
- The `emissive` property sets the emissive (light-emitting) color of the material
- The `emissiveIntensity` property controls the intensity of the emissive color
- `MeshBasicMaterial` doesn't calculate lighting and doesn't support emissive properties
- `MeshStandardMaterial` is physically based and supports emissive properties

## Impact
- Resolved console warnings
- Maintained the intended visual effects (glowing elements)
- Improved code correctness by using the appropriate material type for the desired effect
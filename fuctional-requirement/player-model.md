# Player Model Creation in Three.js

To create a detailed `3D Monk Character` model using Three.js, use a combination of basic shapes and more complex geometry to represent different parts of the character. Here's a detailed breakdown:

### Head and Face
- **Head**: 
  - **Shape**: SphereGeometry with a radius of 10.
  - **Position**: Centered at (0, 50, 0).
  - **Color**: Skin tone (e.g., `0xF5CBA7`).

- **Eyes**:
  - **Shape**: Two small SphereGeometries with a radius of 1.
  - **Position**: Placed symmetrically on the head at (2, 52, 9) and (-2, 52, 9).
  - **Color**: White for the sclera (`0xFFFFFF`) and black for the pupils (`0x000000`).

- **Beard**:
  - **Shape**: TorusGeometry for the mustache and CylinderGeometry for the beard.
  - **Position**: Mustache at (0, 48, 10), beard at (0, 45, 0).
  - **Color**: Dark brown (`0x4D2600`).

### Torso
- **Chest**:
  - **Shape**: BoxGeometry with dimensions (20, 30, 10).
  - **Position**: Centered at (0, 30, 0).
  - **Color**: Yellow (`0xF1C40F`).

- **Muscles**:
  - **Shape**: Use smaller BoxGeometries or custom shapes to simulate muscles.
  - **Position**: Slightly protruding from the chest at various points.
  - **Color**: Slightly darker skin tone for shading.

### Arms
- **Upper Arms**:
  - **Shape**: CylinderGeometry with a radius of 3 and height of 15.
  - **Position**: Attached to the sides of the chest at (15, 30, 0) and (-15, 30, 0).
  - **Color**: Skin tone.

- **Forearms**:
  - **Shape**: CylinderGeometry with a radius of 2.5 and height of 15.
  - **Position**: Connected to the upper arms at (15, 15, 0) and (-15, 15, 0).
  - **Color**: Skin tone.

- **Hands**:
  - **Shape**: BoxGeometry for the palms and smaller boxes for fingers.
  - **Position**: At the end of the forearms.
  - **Color**: Skin tone.

### Legs
- **Thighs**:
  - **Shape**: CylinderGeometry with a radius of 4 and height of 20.
  - **Position**: Attached to the bottom of the torso at (5, 0, 0) and (-5, 0, 0).
  - **Color**: Dark gray (`0x2C3E50`).

- **Calves**:
  - **Shape**: CylinderGeometry with a radius of 3 and height of 20.
  - **Position**: Below the thighs.
  - **Color**: Dark gray.

- **Feet**:
  - **Shape**: BoxGeometry with dimensions (4, 2, 8).
  - **Position**: At the bottom of the calves.
  - **Color**: Dark gray.

### Additional Details
- **Necklace**:
  - **Shape**: TorusGeometry with a small radius.
  - **Position**: Around the neck.
  - **Color**: Gold (`0xFFD700`).

- **Sash and Belt**:
  - **Shape**: PlaneGeometry for the sash and CylinderGeometry for the belt.
  - **Position**: Wrapped around the waist.
  - **Color**: Yellow for the sash, dark brown for the belt.

- **Tattoo**:
  - **Texture**: Apply a texture map to the arms for tattoos.
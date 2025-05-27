# Multiplayer Implementation with WebRTC

<!-- TOC -->

- [Multiplayer Implementation with WebRTC](#multiplayer-implementation-with-webrtc)
    - [Overview](#overview)
    - [Architecture](#architecture)
        - [Host-Based Model](#host-based-model)
        - [Data Flow](#data-flow)
    - [WebRTC Implementation](#webrtc-implementation)
        - [Library Selection: PeerJS](#library-selection-peerjs)
        - [Connection Flow](#connection-flow)
    - [Implementation Plan](#implementation-plan)
        - [Setup Dependencies](#setup-dependencies)
        - [MultiplayerManager Implementation](#multiplayermanager-implementation)
        - [Enemy Manager Enhancements](#enemy-manager-enhancements)
        - [Player Class Enhancements](#player-class-enhancements)
    - [Required Dependencies](#required-dependencies)
    - [Considerations and Limitations](#considerations-and-limitations)
    - [Multiplayer System Optimization](#multiplayer-system-optimization)
        - [Issue](#issue)
        - [Solution](#solution)
        - [Benefits](#benefits)
    - [Conclusion](#conclusion)

<!-- /TOC -->

## Overview

This document outlines the implementation of multiplayer functionality in Monk Journey using WebRTC for peer-to-peer connections. The multiplayer system will follow a host-based model where one player acts as the host and others join as members.

## Architecture

### Host-Based Model

1. **Host Responsibilities**:
   - Share the game environment
   - Track all player positions
   - Spawn enemies around players
   - Handle core game logic
   - Broadcast game state to members

2. **Member Responsibilities**:
   - Receive game state from host
   - Render local view based on received data
   - Handle local input and send to host
   - Compute local collision detection
   - Render effects locally

### Data Flow

```
┌─────────┐                 ┌─────────┐
│         │◄───Position────►│         │
│         │                 │         │
│         │◄───Actions─────►│         │
│  HOST   │                 │ MEMBER  │
│         │───Game State───►│         │
│         │                 │         │
│         │───Enemies──────►│         │
└─────────┘                 └─────────┘
```

## WebRTC Implementation

### Library Selection: PeerJS

After evaluating available WebRTC libraries, we recommend using **PeerJS** for the following reasons:

1. **Simplified API**: PeerJS abstracts away much of the complexity of WebRTC
2. **Active Maintenance**: Regular updates and good community support
3. **Built-in Signaling**: Includes a signaling server solution
4. **Easy Setup**: Minimal configuration required
5. **Good Documentation**: Well-documented with examples

### Connection Flow

1. **Host Setup**:
   - Initialize PeerJS instance
   - Generate a unique room ID
   - Display connection code/QR code
   - Wait for member connections

2. **Member Join**:
   - Initialize PeerJS instance
   - Enter host's connection code or scan QR
   - Connect to host
   - Receive initial game state

3. **Game Synchronization**:
   - Host broadcasts game state at regular intervals (10-20 times per second)
   - Members send input actions to host immediately
   - Host processes inputs and updates game state

## Implementation Plan

### 1. Setup Dependencies

Add PeerJS to the project:

```html
<!-- Add to index.html -->
<script src="https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js"></script>
```

Or install via npm if using a build system:

```bash
npm install peerjs
```

### 2. MultiplayerManager Implementation

Enhance the existing `MultiplayerManager` class to handle WebRTC connections:

### 3. Enemy Manager Enhancements

Add methods to the `EnemyManager` class to support multiplayer:

### 4. Player Class Enhancements

Add methods to the `Player` class to support multiplayer:

## Required Dependencies

1. **PeerJS**: For WebRTC connections
   ```
   npm install peerjs
   ```

2. **QR Code Library** (optional): For generating and scanning QR codes
   ```
   npm install qrcode
   npm install instascan
   ```

## Considerations and Limitations

1. **Network Latency**: WebRTC provides low latency, but there will still be some delay. Implement client-side prediction for smoother gameplay.

2. **Scalability**: P2P connections work well for small groups (2-8 players). For larger groups, consider a server-based approach.

3. **NAT Traversal**: Some networks may block WebRTC connections. Use a TURN server as fallback.

4. **Bandwidth**: Limit the amount of data sent over the network. Only send essential updates.

5. **Synchronization**: Handle clock synchronization between players to ensure consistent gameplay.

6. **Fallback**: Implement a fallback to WebSockets if WebRTC fails to connect.

## 9. Multiplayer System Optimization

### Issue
The multiplayer system was experiencing issues with invalid player positions and inefficient data transmission:
- `[MultiplayerManager] Cannot send player data: position or rotation is undefined` errors on member clients
- Excessive bandwidth usage due to sending full player and enemy data
- Performance issues due to large data packets being sent frequently

### Solution
Implemented a comprehensive optimization of the multiplayer system with a focus on enemy data sharing:

1. **Optimized Player Position Handling**:
   - Enhanced position validation in `sendPlayerData()` to prevent errors
   - Added fallback to player movement component for more reliable position data
   - Reduced rotation data to only y-axis (yaw) to save bandwidth

2. **Optimized Enemy Data Format**:
   - Shortened property names (e.g., `position` → `p`, `health` → `h`)
   - Rounded position values to 2 decimal places to reduce data size
   - Only sending y-rotation instead of full x,y,z rotation
   - Only including maxHealth when necessary (new enemies or health changes)

3. **Reduced Network Traffic**:
   - Minimized console logging to reduce CPU usage
   - Focused data transmission on enemy information
   - Simplified player data to essential information only

4. **Enhanced Error Handling**:
   - Added comprehensive validation for all incoming network data
   - Implemented fallbacks for missing or invalid data
   - Added support for both legacy and optimized data formats

### Benefits
- **Reduced Bandwidth Usage**: Estimated 50-70% reduction in data transfer
- **Improved Performance**: Less CPU usage for serialization/deserialization
- **Better Stability**: Robust error handling prevents crashes from invalid data
- **Backward Compatibility**: Works with both old and new data formats

## Conclusion

WebRTC provides a viable solution for implementing multiplayer functionality in Monk Journey with minimal server requirements. The host-based model allows for a straightforward implementation where one player acts as the authority for game state.

By using PeerJS, we can abstract away much of the complexity of WebRTC and focus on game-specific logic. The implementation outlined in this document provides a foundation for building a robust multiplayer experience.

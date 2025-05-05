/**
 * PlayerModel.js
 * Handles the player's 3D model and animations
 * Implements a highly detailed Ghibli-style monk character
 */

import * as THREE from 'three';
import { IPlayerModel } from './PlayerInterface.js';

export class PlayerModel extends IPlayerModel {
    constructor(scene) {
        super();
        
        this.scene = scene;
        this.modelGroup = null;
        this.modelParts = {};
    }
    
    async createModel() {
        // Create a group for the player
        this.modelGroup = new THREE.Group();
        
        // Create a scale factor to maintain proportions
        const scale = 0.05; // Scale down from the specifications in the requirements
        
        // ===== ADVANCED MATERIALS WITH GHIBLI AESTHETICS =====
        // Create custom materials with enhanced Ghibli-style shading
        // Skin material with subtle variations for muscle definition
        const skinMaterial = new THREE.MeshToonMaterial({ 
            color: 0xF5CBA7, // Warm skin tone
            emissive: 0x553311,
            emissiveIntensity: 0.1,
            flatShading: true
        });
        
        // Darker skin material for muscle definition and shadows
        const muscleShadowMaterial = new THREE.MeshToonMaterial({ 
            color: 0xE3A887, // Slightly darker for muscle definition
            emissive: 0x442200,
            emissiveIntensity: 0.1,
            flatShading: true
        });
        
        // Highlighted skin for muscle peaks
        const muscleHighlightMaterial = new THREE.MeshToonMaterial({ 
            color: 0xFFD6B5, // Slightly lighter for muscle highlights
            emissive: 0x664422,
            emissiveIntensity: 0.1,
            flatShading: true
        });
        
        // Vibrant yellow robe with rich texture
        const yellowRobeMaterial = new THREE.MeshToonMaterial({ 
            color: 0xF1C40F, // Vibrant yellow for monk robe
            emissive: 0x996600,
            emissiveIntensity: 0.15,
            flatShading: true
        });
        
        // Darker yellow for robe folds and shadows
        const robeShadowMaterial = new THREE.MeshToonMaterial({ 
            color: 0xD4A90D, // Darker yellow for folds
            emissive: 0x774400,
            emissiveIntensity: 0.1,
            flatShading: true
        });
        
        // Lighter yellow for robe highlights
        const robeHighlightMaterial = new THREE.MeshToonMaterial({ 
            color: 0xFFE03C, // Brighter yellow for highlights
            emissive: 0xBB8800,
            emissiveIntensity: 0.2,
            flatShading: true
        });
        
        // Dark gray for pants with subtle texture
        const darkGrayMaterial = new THREE.MeshToonMaterial({ 
            color: 0x2C3E50, // Dark gray for pants
            emissive: 0x111A22,
            emissiveIntensity: 0.05,
            flatShading: true
        });
        
        // Gold material with enhanced shine for accessories
        const goldMaterial = new THREE.MeshToonMaterial({ 
            color: 0xFFD700, // Gold for accessories
            emissive: 0xCC9900,
            emissiveIntensity: 0.3,
            flatShading: true
        });
        
        // Rich dark brown for beard and belt
        const darkBrownMaterial = new THREE.MeshToonMaterial({ 
            color: 0x4D2600, // Dark brown for beard and belt
            emissive: 0x2A1600,
            emissiveIntensity: 0.1,
            flatShading: true
        });
        
        // Pure white for eyes with subtle glow
        const whiteMaterial = new THREE.MeshToonMaterial({ 
            color: 0xFFFFFF, // White for eyes
            emissive: 0xCCCCCC,
            emissiveIntensity: 0.1,
            flatShading: true
        });
        
        // Deep black for pupils with subtle depth
        const blackMaterial = new THREE.MeshToonMaterial({ 
            color: 0x000000, // Black for pupils
            emissive: 0x000000,
            emissiveIntensity: 0.05,
            flatShading: true
        });
        
        // ===== HEAD AND FACE - ENHANCED DETAIL =====
        // Create head group for better organization
        const headGroup = new THREE.Group();
        
        // Base head shape (slightly elongated sphere for Ghibli style)
        const headGeometry = new THREE.SphereGeometry(10 * scale, 32, 32);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.scale.set(1, 1.1, 1); // Slightly elongate for Ghibli style
        head.castShadow = true;
        headGroup.add(head);
        this.modelParts.head = head;
        
        // Add cranium details (subtle bumps for character)
        const craniumGeometry = new THREE.SphereGeometry(9.8 * scale, 16, 16);
        const cranium = new THREE.Mesh(craniumGeometry, skinMaterial);
        cranium.position.y = 1 * scale;
        cranium.scale.set(1, 0.7, 1.05);
        headGroup.add(cranium);
        
        // Create detailed face features
        // Cheekbones (subtle geometry for character)
        const leftCheekGeometry = new THREE.SphereGeometry(2 * scale, 8, 8);
        const leftCheek = new THREE.Mesh(leftCheekGeometry, muscleHighlightMaterial);
        leftCheek.position.set(4 * scale, -1 * scale, 8 * scale);
        leftCheek.scale.set(1.2, 0.7, 0.6);
        headGroup.add(leftCheek);
        
        const rightCheekGeometry = new THREE.SphereGeometry(2 * scale, 8, 8);
        const rightCheek = new THREE.Mesh(rightCheekGeometry, muscleHighlightMaterial);
        rightCheek.position.set(-4 * scale, -1 * scale, 8 * scale);
        rightCheek.scale.set(1.2, 0.7, 0.6);
        headGroup.add(rightCheek);
        
        // Nose (characteristic Ghibli style - simple but defined)
        const noseGeometry = new THREE.ConeGeometry(1.5 * scale, 3 * scale, 4);
        const nose = new THREE.Mesh(noseGeometry, skinMaterial);
        nose.position.set(0, 0, 10 * scale);
        nose.rotation.x = -Math.PI / 2;
        nose.scale.set(1, 1, 0.8);
        headGroup.add(nose);
        
        // Ears (stylized half-torus shapes)
        const earGeometry = new THREE.TorusGeometry(2 * scale, 0.8 * scale, 8, 12, Math.PI);
        
        const leftEar = new THREE.Mesh(earGeometry, skinMaterial);
        leftEar.position.set(9 * scale, 2 * scale, 0);
        leftEar.rotation.y = -Math.PI / 2;
        leftEar.castShadow = true;
        headGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, skinMaterial);
        rightEar.position.set(-9 * scale, 2 * scale, 0);
        rightEar.rotation.y = Math.PI / 2;
        rightEar.castShadow = true;
        headGroup.add(rightEar);
        
        // Create detailed eyes with eyelids
        // Eye sockets (subtle indentation)
        const leftEyeSocketGeometry = new THREE.SphereGeometry(2.5 * scale, 16, 16);
        const leftEyeSocket = new THREE.Mesh(leftEyeSocketGeometry, muscleShadowMaterial);
        leftEyeSocket.position.set(3.5 * scale, 2 * scale, 8.5 * scale);
        leftEyeSocket.scale.set(1, 0.7, 0.2);
        headGroup.add(leftEyeSocket);
        
        const rightEyeSocketGeometry = new THREE.SphereGeometry(2.5 * scale, 16, 16);
        const rightEyeSocket = new THREE.Mesh(rightEyeSocketGeometry, muscleShadowMaterial);
        rightEyeSocket.position.set(-3.5 * scale, 2 * scale, 8.5 * scale);
        rightEyeSocket.scale.set(1, 0.7, 0.2);
        headGroup.add(rightEyeSocket);
        
        // Left eye (white part) - larger for Ghibli style
        const leftEyeGeometry = new THREE.SphereGeometry(1.8 * scale, 24, 24);
        const leftEye = new THREE.Mesh(leftEyeGeometry, whiteMaterial);
        leftEye.position.set(3.5 * scale, 2 * scale, 9.2 * scale);
        leftEye.scale.set(1, 1, 0.6); // Flatten slightly
        leftEye.castShadow = false;
        headGroup.add(leftEye);
        this.modelParts.leftEye = leftEye;
        
        // Left pupil - large for expressive Ghibli look
        const leftPupilGeometry = new THREE.SphereGeometry(0.9 * scale, 16, 16);
        const leftPupil = new THREE.Mesh(leftPupilGeometry, blackMaterial);
        leftPupil.position.set(3.5 * scale, 2 * scale, 9.8 * scale);
        leftPupil.scale.set(1, 1, 0.5);
        headGroup.add(leftPupil);
        this.modelParts.leftPupil = leftPupil;
        
        // Left eyelid
        const leftEyelidGeometry = new THREE.SphereGeometry(1.9 * scale, 16, 16);
        const leftEyelid = new THREE.Mesh(leftEyelidGeometry, skinMaterial);
        leftEyelid.position.set(3.5 * scale, 3 * scale, 9.2 * scale);
        leftEyelid.scale.set(1, 0.3, 0.6);
        headGroup.add(leftEyelid);
        this.modelParts.leftEyelid = leftEyelid;
        
        // Right eye (white part)
        const rightEyeGeometry = new THREE.SphereGeometry(1.8 * scale, 24, 24);
        const rightEye = new THREE.Mesh(rightEyeGeometry, whiteMaterial);
        rightEye.position.set(-3.5 * scale, 2 * scale, 9.2 * scale);
        rightEye.scale.set(1, 1, 0.6); // Flatten slightly
        rightEye.castShadow = false;
        headGroup.add(rightEye);
        this.modelParts.rightEye = rightEye;
        
        // Right pupil
        const rightPupilGeometry = new THREE.SphereGeometry(0.9 * scale, 16, 16);
        const rightPupil = new THREE.Mesh(rightPupilGeometry, blackMaterial);
        rightPupil.position.set(-3.5 * scale, 2 * scale, 9.8 * scale);
        rightPupil.scale.set(1, 1, 0.5);
        headGroup.add(rightPupil);
        this.modelParts.rightPupil = rightPupil;
        
        // Right eyelid
        const rightEyelidGeometry = new THREE.SphereGeometry(1.9 * scale, 16, 16);
        const rightEyelid = new THREE.Mesh(rightEyelidGeometry, skinMaterial);
        rightEyelid.position.set(-3.5 * scale, 3 * scale, 9.2 * scale);
        rightEyelid.scale.set(1, 0.3, 0.6);
        headGroup.add(rightEyelid);
        this.modelParts.rightEyelid = rightEyelid;
        
        // Eyebrows (characteristic thick Ghibli eyebrows)
        const leftEyebrowGeometry = new THREE.BoxGeometry(3 * scale, 0.8 * scale, 0.8 * scale);
        const leftEyebrow = new THREE.Mesh(leftEyebrowGeometry, darkBrownMaterial);
        leftEyebrow.position.set(3.5 * scale, 4.5 * scale, 9.5 * scale);
        leftEyebrow.rotation.z = Math.PI / 12; // Slight angle
        headGroup.add(leftEyebrow);
        this.modelParts.leftEyebrow = leftEyebrow;
        
        const rightEyebrowGeometry = new THREE.BoxGeometry(3 * scale, 0.8 * scale, 0.8 * scale);
        const rightEyebrow = new THREE.Mesh(rightEyebrowGeometry, darkBrownMaterial);
        rightEyebrow.position.set(-3.5 * scale, 4.5 * scale, 9.5 * scale);
        rightEyebrow.rotation.z = -Math.PI / 12; // Slight angle
        headGroup.add(rightEyebrow);
        this.modelParts.rightEyebrow = rightEyebrow;
        
        // Create detailed beard and facial hair
        // Mustache (custom shape for character)
        const mustacheGroup = new THREE.Group();
        
        // Main mustache part (curved shape)
        const mustacheCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-4 * scale, -2 * scale, 10 * scale),
            new THREE.Vector3(-2 * scale, -3 * scale, 10.5 * scale),
            new THREE.Vector3(0, -3.2 * scale, 10.8 * scale),
            new THREE.Vector3(2 * scale, -3 * scale, 10.5 * scale),
            new THREE.Vector3(4 * scale, -2 * scale, 10 * scale)
        ]);
        
        const mustacheGeometry = new THREE.TubeGeometry(mustacheCurve, 20, 1 * scale, 8, false);
        const mustache = new THREE.Mesh(mustacheGeometry, darkBrownMaterial);
        mustacheGroup.add(mustache);
        
        // Mustache ends (small spheres for detail)
        const leftMustacheEndGeometry = new THREE.SphereGeometry(1.2 * scale, 8, 8);
        const leftMustacheEnd = new THREE.Mesh(leftMustacheEndGeometry, darkBrownMaterial);
        leftMustacheEnd.position.set(4 * scale, -2 * scale, 10 * scale);
        mustacheGroup.add(leftMustacheEnd);
        
        const rightMustacheEndGeometry = new THREE.SphereGeometry(1.2 * scale, 8, 8);
        const rightMustacheEnd = new THREE.Mesh(rightMustacheEndGeometry, darkBrownMaterial);
        rightMustacheEnd.position.set(-4 * scale, -2 * scale, 10 * scale);
        mustacheGroup.add(rightMustacheEnd);
        
        headGroup.add(mustacheGroup);
        
        // Beard (more detailed with multiple parts)
        const beardGroup = new THREE.Group();
        
        // Main beard part
        const beardGeometry = new THREE.CylinderGeometry(4 * scale, 6 * scale, 6 * scale, 12);
        const beard = new THREE.Mesh(beardGeometry, darkBrownMaterial);
        beard.position.set(0, -5 * scale, 8 * scale);
        beardGroup.add(beard);
        
        // Beard strands (small cylinders for texture)
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 4 * scale;
            const strandGeometry = new THREE.CylinderGeometry(0.3 * scale, 0.1 * scale, 2 * scale, 4);
            const strand = new THREE.Mesh(strandGeometry, darkBrownMaterial);
            
            strand.position.set(
                Math.cos(angle) * radius,
                -8 * scale,
                Math.sin(angle) * radius + 8 * scale
            );
            
            strand.rotation.x = Math.PI / 4;
            strand.rotation.y = angle;
            beardGroup.add(strand);
        }
        
        headGroup.add(beardGroup);
        
        // Position the head group
        headGroup.position.y = 50 * scale;
        this.modelGroup.add(headGroup);
        
        // ===== NECK =====
        // Create detailed neck with muscle definition
        const neckGroup = new THREE.Group();
        
        // Main neck cylinder
        const neckGeometry = new THREE.CylinderGeometry(4 * scale, 5 * scale, 8 * scale, 16);
        const neck = new THREE.Mesh(neckGeometry, skinMaterial);
        neckGroup.add(neck);
        
        // Adam's apple detail
        const adamsAppleGeometry = new THREE.SphereGeometry(1 * scale, 8, 8);
        const adamsApple = new THREE.Mesh(adamsAppleGeometry, skinMaterial);
        adamsApple.position.set(0, -1 * scale, 3 * scale);
        adamsApple.scale.set(1, 1.2, 0.8);
        neckGroup.add(adamsApple);
        
        // Neck muscles (trapezius)
        const leftTrapGeometry = new THREE.CylinderGeometry(1 * scale, 2 * scale, 6 * scale, 8);
        const leftTrap = new THREE.Mesh(leftTrapGeometry, muscleShadowMaterial);
        leftTrap.position.set(3 * scale, 0, -1 * scale);
        leftTrap.rotation.x = Math.PI / 6;
        leftTrap.rotation.z = Math.PI / 8;
        neckGroup.add(leftTrap);
        
        const rightTrapGeometry = new THREE.CylinderGeometry(1 * scale, 2 * scale, 6 * scale, 8);
        const rightTrap = new THREE.Mesh(rightTrapGeometry, muscleShadowMaterial);
        rightTrap.position.set(-3 * scale, 0, -1 * scale);
        rightTrap.rotation.x = Math.PI / 6;
        rightTrap.rotation.z = -Math.PI / 8;
        neckGroup.add(rightTrap);
        
        // Position the neck group
        neckGroup.position.y = 42 * scale;
        this.modelGroup.add(neckGroup);
        
        // ===== TORSO - HIGHLY DETAILED =====
        // Create torso group for better organization
        const torsoGroup = new THREE.Group();
        
        // Main chest shape (modified box with better proportions)
        const chestGeometry = new THREE.BoxGeometry(22 * scale, 30 * scale, 12 * scale);
        const chest = new THREE.Mesh(chestGeometry, yellowRobeMaterial);
        chest.castShadow = true;
        torsoGroup.add(chest);
        this.modelParts.chest = chest;
        
        // Create detailed muscle structure under robe
        // Pectoral muscles (more defined)
        const pectoralGroup = new THREE.Group();
        
        // Left pectoral
        const leftPecGeometry = new THREE.SphereGeometry(6 * scale, 16, 16);
        const leftPec = new THREE.Mesh(leftPecGeometry, yellowRobeMaterial);
        leftPec.position.set(6 * scale, 5 * scale, 6 * scale);
        leftPec.scale.set(1, 1.2, 0.5);
        pectoralGroup.add(leftPec);
        
        // Right pectoral
        const rightPecGeometry = new THREE.SphereGeometry(6 * scale, 16, 16);
        const rightPec = new THREE.Mesh(rightPecGeometry, yellowRobeMaterial);
        rightPec.position.set(-6 * scale, 5 * scale, 6 * scale);
        rightPec.scale.set(1, 1.2, 0.5);
        pectoralGroup.add(rightPec);
        
        // Center chest definition
        const centerPecGeometry = new THREE.BoxGeometry(4 * scale, 15 * scale, 1 * scale);
        const centerPec = new THREE.Mesh(centerPecGeometry, robeShadowMaterial);
        centerPec.position.set(0, 5 * scale, 6.5 * scale);
        pectoralGroup.add(centerPec);
        
        torsoGroup.add(pectoralGroup);
        
        // Create detailed robe with folds and texture
        // Robe collar (around neck)
        const collarGeometry = new THREE.TorusGeometry(5.5 * scale, 2 * scale, 16, 24);
        const collar = new THREE.Mesh(collarGeometry, yellowRobeMaterial);
        collar.position.set(0, 14 * scale, 0);
        collar.rotation.x = Math.PI / 2;
        collar.scale.set(1, 1, 0.5);
        torsoGroup.add(collar);
        
        // Robe folds (multiple curved surfaces)
        // Create vertical folds on the robe
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 10 * scale;
            
            // Skip the back part
            if (angle > Math.PI / 2 && angle < Math.PI * 1.5) continue;
            
            const foldCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(Math.cos(angle) * radius, 14 * scale, Math.sin(angle) * radius),
                new THREE.Vector3(Math.cos(angle) * (radius + 1 * scale), 7 * scale, Math.sin(angle) * (radius + 1 * scale)),
                new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
                new THREE.Vector3(Math.cos(angle) * (radius - 1 * scale), -7 * scale, Math.sin(angle) * (radius - 1 * scale)),
                new THREE.Vector3(Math.cos(angle) * radius, -14 * scale, Math.sin(angle) * radius)
            ]);
            
            const foldGeometry = new THREE.TubeGeometry(foldCurve, 20, 0.8 * scale, 8, false);
            const fold = new THREE.Mesh(foldGeometry, i % 2 === 0 ? robeShadowMaterial : yellowRobeMaterial);
            torsoGroup.add(fold);
        }
        
        // Horizontal robe folds (across chest and waist)
        const chestFoldCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-10 * scale, 5 * scale, 6 * scale),
            new THREE.Vector3(-5 * scale, 4 * scale, 6.5 * scale),
            new THREE.Vector3(0, 3.5 * scale, 6.8 * scale),
            new THREE.Vector3(5 * scale, 4 * scale, 6.5 * scale),
            new THREE.Vector3(10 * scale, 5 * scale, 6 * scale)
        ]);
        
        const chestFoldGeometry = new THREE.TubeGeometry(chestFoldCurve, 20, 0.8 * scale, 8, false);
        const chestFold = new THREE.Mesh(chestFoldGeometry, robeShadowMaterial);
        torsoGroup.add(chestFold);
        
        // Waist fold
        const waistFoldCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-11 * scale, -10 * scale, 4 * scale),
            new THREE.Vector3(-6 * scale, -11 * scale, 5 * scale),
            new THREE.Vector3(0, -11.5 * scale, 5.5 * scale),
            new THREE.Vector3(6 * scale, -11 * scale, 5 * scale),
            new THREE.Vector3(11 * scale, -10 * scale, 4 * scale)
        ]);
        
        const waistFoldGeometry = new THREE.TubeGeometry(waistFoldCurve, 20, 1 * scale, 8, false);
        const waistFold = new THREE.Mesh(waistFoldGeometry, robeShadowMaterial);
        torsoGroup.add(waistFold);
        
        // Shoulder details
        // Left shoulder pad
        const leftShoulderGeometry = new THREE.SphereGeometry(5 * scale, 16, 16);
        const leftShoulder = new THREE.Mesh(leftShoulderGeometry, yellowRobeMaterial);
        leftShoulder.position.set(11 * scale, 12 * scale, 0);
        leftShoulder.scale.set(1, 0.8, 1);
        torsoGroup.add(leftShoulder);
        
        // Right shoulder pad
        const rightShoulderGeometry = new THREE.SphereGeometry(5 * scale, 16, 16);
        const rightShoulder = new THREE.Mesh(rightShoulderGeometry, yellowRobeMaterial);
        rightShoulder.position.set(-11 * scale, 12 * scale, 0);
        rightShoulder.scale.set(1, 0.8, 1);
        torsoGroup.add(rightShoulder);
        
        // Shoulder decorative patterns (circular designs)
        const leftShoulderPatternGeometry = new THREE.TorusGeometry(2 * scale, 0.5 * scale, 8, 16);
        const leftShoulderPattern = new THREE.Mesh(leftShoulderPatternGeometry, goldMaterial);
        leftShoulderPattern.position.set(11 * scale, 12 * scale, 3 * scale);
        leftShoulderPattern.rotation.x = Math.PI / 3;
        torsoGroup.add(leftShoulderPattern);
        
        const rightShoulderPatternGeometry = new THREE.TorusGeometry(2 * scale, 0.5 * scale, 8, 16);
        const rightShoulderPattern = new THREE.Mesh(rightShoulderPatternGeometry, goldMaterial);
        rightShoulderPattern.position.set(-11 * scale, 12 * scale, 3 * scale);
        rightShoulderPattern.rotation.x = Math.PI / 3;
        torsoGroup.add(rightShoulderPattern);
        
        // Position the torso group
        torsoGroup.position.y = 30 * scale;
        this.modelGroup.add(torsoGroup);
        
        // ===== ARMS - ENHANCED MUSCLE DEFINITION =====
        // Create left arm group
        const leftArmGroup = new THREE.Group();
        
        // Upper arm with muscle definition
        // Main upper arm cylinder
        const leftUpperArmGeometry = new THREE.CylinderGeometry(3.5 * scale, 3 * scale, 15 * scale, 16);
        const leftUpperArm = new THREE.Mesh(leftUpperArmGeometry, skinMaterial);
        leftUpperArm.castShadow = true;
        leftArmGroup.add(leftUpperArm);
        this.modelParts.leftUpperArm = leftUpperArm;
        
        // Bicep muscle (bulge on front)
        const leftBicepGeometry = new THREE.SphereGeometry(3 * scale, 16, 16);
        const leftBicep = new THREE.Mesh(leftBicepGeometry, muscleHighlightMaterial);
        leftBicep.position.set(0, -2 * scale, 2 * scale);
        leftBicep.scale.set(0.8, 1, 0.6);
        leftUpperArm.add(leftBicep);
        
        // Tricep muscle (back of arm)
        const leftTricepGeometry = new THREE.SphereGeometry(2.5 * scale, 16, 16);
        const leftTricep = new THREE.Mesh(leftTricepGeometry, muscleShadowMaterial);
        leftTricep.position.set(0, -3 * scale, -2 * scale);
        leftTricep.scale.set(0.8, 0.9, 0.6);
        leftUpperArm.add(leftTricep);
        
        // Deltoid (shoulder muscle)
        const leftDeltoidGeometry = new THREE.SphereGeometry(3.5 * scale, 16, 16);
        const leftDeltoid = new THREE.Mesh(leftDeltoidGeometry, muscleHighlightMaterial);
        leftDeltoid.position.set(0, 6 * scale, 0);
        leftDeltoid.scale.set(1, 0.7, 1);
        leftUpperArm.add(leftDeltoid);
        
        // Forearm with muscle definition
        // Main forearm cylinder
        const leftForearmGeometry = new THREE.CylinderGeometry(3 * scale, 2.5 * scale, 15 * scale, 16);
        const leftForearm = new THREE.Mesh(leftForearmGeometry, skinMaterial);
        leftForearm.position.set(0, -15 * scale, 0);
        leftForearm.castShadow = true;
        leftArmGroup.add(leftForearm);
        this.modelParts.leftForearm = leftForearm;
        
        // Forearm muscle bulge
        const leftForearmMuscleGeometry = new THREE.SphereGeometry(2.8 * scale, 16, 16);
        const leftForearmMuscle = new THREE.Mesh(leftForearmMuscleGeometry, muscleHighlightMaterial);
        leftForearmMuscle.position.set(0, -3 * scale, 1 * scale);
        leftForearmMuscle.scale.set(0.8, 1, 0.6);
        leftForearm.add(leftForearmMuscle);
        
        // Detailed hand
        const leftHandGroup = new THREE.Group();
        
        // Palm
        const leftPalmGeometry = new THREE.BoxGeometry(5 * scale, 2 * scale, 6 * scale);
        const leftPalm = new THREE.Mesh(leftPalmGeometry, skinMaterial);
        leftHandGroup.add(leftPalm);
        
        // Thumb
        const leftThumbGeometry = new THREE.CylinderGeometry(0.8 * scale, 0.6 * scale, 4 * scale, 8);
        const leftThumb = new THREE.Mesh(leftThumbGeometry, skinMaterial);
        leftThumb.position.set(3 * scale, 0, 2 * scale);
        leftThumb.rotation.z = Math.PI / 4;
        leftThumb.rotation.y = Math.PI / 6;
        leftHandGroup.add(leftThumb);
        
        // Fingers
        for (let i = 0; i < 4; i++) {
            const offset = (i - 1.5) * 1.2 * scale;
            
            const leftFingerGeometry = new THREE.CylinderGeometry(0.7 * scale, 0.5 * scale, 5 * scale, 8);
            const leftFinger = new THREE.Mesh(leftFingerGeometry, skinMaterial);
            leftFinger.position.set(offset, 0, 3 * scale);
            leftFinger.rotation.x = Math.PI / 2;
            leftFinger.rotation.z = Math.PI / 12;
            leftHandGroup.add(leftFinger);
        }
        
        leftHandGroup.position.set(0, -25 * scale, 0);
        leftArmGroup.add(leftHandGroup);
        this.modelParts.leftHand = leftHandGroup;
        
        // Position the left arm group
        leftArmGroup.position.set(15 * scale, 30 * scale, 0);
        leftArmGroup.rotation.z = Math.PI / 12; // Slight angle
        this.modelGroup.add(leftArmGroup);
        
        // Create right arm group (mirror of left)
        const rightArmGroup = new THREE.Group();
        
        // Upper arm with muscle definition
        // Main upper arm cylinder
        const rightUpperArmGeometry = new THREE.CylinderGeometry(3.5 * scale, 3 * scale, 15 * scale, 16);
        const rightUpperArm = new THREE.Mesh(rightUpperArmGeometry, skinMaterial);
        rightUpperArm.castShadow = true;
        rightArmGroup.add(rightUpperArm);
        this.modelParts.rightUpperArm = rightUpperArm;
        
        // Bicep muscle (bulge on front)
        const rightBicepGeometry = new THREE.SphereGeometry(3 * scale, 16, 16);
        const rightBicep = new THREE.Mesh(rightBicepGeometry, muscleHighlightMaterial);
        rightBicep.position.set(0, -2 * scale, 2 * scale);
        rightBicep.scale.set(0.8, 1, 0.6);
        rightUpperArm.add(rightBicep);
        
        // Tricep muscle (back of arm)
        const rightTricepGeometry = new THREE.SphereGeometry(2.5 * scale, 16, 16);
        const rightTricep = new THREE.Mesh(rightTricepGeometry, muscleShadowMaterial);
        rightTricep.position.set(0, -3 * scale, -2 * scale);
        rightTricep.scale.set(0.8, 0.9, 0.6);
        rightUpperArm.add(rightTricep);
        
        // Deltoid (shoulder muscle)
        const rightDeltoidGeometry = new THREE.SphereGeometry(3.5 * scale, 16, 16);
        const rightDeltoid = new THREE.Mesh(rightDeltoidGeometry, muscleHighlightMaterial);
        rightDeltoid.position.set(0, 6 * scale, 0);
        rightDeltoid.scale.set(1, 0.7, 1);
        rightUpperArm.add(rightDeltoid);
        
        // Forearm with muscle definition
        // Main forearm cylinder
        const rightForearmGeometry = new THREE.CylinderGeometry(3 * scale, 2.5 * scale, 15 * scale, 16);
        const rightForearm = new THREE.Mesh(rightForearmGeometry, skinMaterial);
        rightForearm.position.set(0, -15 * scale, 0);
        rightForearm.castShadow = true;
        rightArmGroup.add(rightForearm);
        this.modelParts.rightForearm = rightForearm;
        
        // Forearm muscle bulge
        const rightForearmMuscleGeometry = new THREE.SphereGeometry(2.8 * scale, 16, 16);
        const rightForearmMuscle = new THREE.Mesh(rightForearmMuscleGeometry, muscleHighlightMaterial);
        rightForearmMuscle.position.set(0, -3 * scale, 1 * scale);
        rightForearmMuscle.scale.set(0.8, 1, 0.6);
        rightForearm.add(rightForearmMuscle);
        
        // Detailed hand
        const rightHandGroup = new THREE.Group();
        
        // Palm
        const rightPalmGeometry = new THREE.BoxGeometry(5 * scale, 2 * scale, 6 * scale);
        const rightPalm = new THREE.Mesh(rightPalmGeometry, skinMaterial);
        rightHandGroup.add(rightPalm);
        
        // Thumb
        const rightThumbGeometry = new THREE.CylinderGeometry(0.8 * scale, 0.6 * scale, 4 * scale, 8);
        const rightThumb = new THREE.Mesh(rightThumbGeometry, skinMaterial);
        rightThumb.position.set(-3 * scale, 0, 2 * scale);
        rightThumb.rotation.z = -Math.PI / 4;
        rightThumb.rotation.y = -Math.PI / 6;
        rightHandGroup.add(rightThumb);
        
        // Fingers
        for (let i = 0; i < 4; i++) {
            const offset = (i - 1.5) * 1.2 * scale;
            
            const rightFingerGeometry = new THREE.CylinderGeometry(0.7 * scale, 0.5 * scale, 5 * scale, 8);
            const rightFinger = new THREE.Mesh(rightFingerGeometry, skinMaterial);
            rightFinger.position.set(offset, 0, 3 * scale);
            rightFinger.rotation.x = Math.PI / 2;
            rightFinger.rotation.z = -Math.PI / 12;
            rightHandGroup.add(rightFinger);
        }
        
        rightHandGroup.position.set(0, -25 * scale, 0);
        rightArmGroup.add(rightHandGroup);
        this.modelParts.rightHand = rightHandGroup;
        
        // Position the right arm group
        rightArmGroup.position.set(-15 * scale, 30 * scale, 0);
        rightArmGroup.rotation.z = -Math.PI / 12; // Slight angle
        this.modelGroup.add(rightArmGroup);
        
        // ===== LOWER BODY =====
        // Create detailed belt and waist
        const beltGroup = new THREE.Group();
        
        // Main belt (cylinder)
        const beltGeometry = new THREE.CylinderGeometry(11 * scale, 11 * scale, 4 * scale, 24);
        const belt = new THREE.Mesh(beltGeometry, darkBrownMaterial);
        belt.castShadow = true;
        beltGroup.add(belt);
        
        // Belt buckle (gold)
        const buckleGeometry = new THREE.BoxGeometry(6 * scale, 3 * scale, 1 * scale);
        const buckle = new THREE.Mesh(buckleGeometry, goldMaterial);
        buckle.position.set(0, 0, 11 * scale);
        beltGroup.add(buckle);
        
        // Belt decorations (small gold studs)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            if (angle > Math.PI / 4 && angle < Math.PI * 7/4) { // Skip front where buckle is
                const studGeometry = new THREE.SphereGeometry(0.6 * scale, 8, 8);
                const stud = new THREE.Mesh(studGeometry, goldMaterial);
                
                stud.position.set(
                    Math.cos(angle) * 11 * scale,
                    0,
                    Math.sin(angle) * 11 * scale
                );
                
                beltGroup.add(stud);
            }
        }
        
        // Position the belt group
        beltGroup.position.y = 15 * scale;
        this.modelGroup.add(beltGroup);
        
        // Create detailed pants/lower robe
        const lowerRobeGroup = new THREE.Group();
        
        // Main lower robe (truncated cone)
        const lowerRobeGeometry = new THREE.CylinderGeometry(11 * scale, 14 * scale, 15 * scale, 24);
        const lowerRobe = new THREE.Mesh(lowerRobeGeometry, yellowRobeMaterial);
        lowerRobe.position.y = -7.5 * scale;
        lowerRobe.castShadow = true;
        lowerRobeGroup.add(lowerRobe);
        
        // Robe folds (vertical lines)
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 12 * scale;
            
            const foldCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(Math.cos(angle) * 11 * scale, 0, Math.sin(angle) * 11 * scale),
                new THREE.Vector3(Math.cos(angle) * 12 * scale, -7.5 * scale, Math.sin(angle) * 12 * scale),
                new THREE.Vector3(Math.cos(angle) * 14 * scale, -15 * scale, Math.sin(angle) * 14 * scale)
            ]);
            
            const foldGeometry = new THREE.TubeGeometry(foldCurve, 10, 0.5 * scale, 8, false);
            const fold = new THREE.Mesh(foldGeometry, i % 2 === 0 ? robeShadowMaterial : yellowRobeMaterial);
            lowerRobeGroup.add(fold);
        }
        
        // Position the lower robe group
        lowerRobeGroup.position.y = 15 * scale;
        this.modelGroup.add(lowerRobeGroup);
        
        // ===== LEGS =====
        // Create left leg group
        const leftLegGroup = new THREE.Group();
        
        // Thigh with muscle definition
        const leftThighGeometry = new THREE.CylinderGeometry(4.5 * scale, 4 * scale, 20 * scale, 16);
        const leftThigh = new THREE.Mesh(leftThighGeometry, darkGrayMaterial);
        leftThigh.castShadow = true;
        leftLegGroup.add(leftThigh);
        this.modelParts.leftThigh = leftThigh;
        
        // Thigh muscle definition (quadriceps)
        const leftQuadGeometry = new THREE.SphereGeometry(4 * scale, 16, 16);
        const leftQuad = new THREE.Mesh(leftQuadGeometry, darkGrayMaterial);
        leftQuad.position.set(0, -3 * scale, 2 * scale);
        leftQuad.scale.set(0.8, 1.2, 0.7);
        leftThigh.add(leftQuad);
        
        // Knee detail
        const leftKneeGeometry = new THREE.SphereGeometry(2 * scale, 16, 16);
        const leftKnee = new THREE.Mesh(leftKneeGeometry, darkGrayMaterial);
        leftKnee.position.set(0, -10 * scale, 2 * scale);
        leftKnee.scale.set(1.5, 1, 1);
        leftThigh.add(leftKnee);
        
        // Calf with muscle definition
        const leftCalfGeometry = new THREE.CylinderGeometry(4 * scale, 3 * scale, 20 * scale, 16);
        const leftCalf = new THREE.Mesh(leftCalfGeometry, darkGrayMaterial);
        leftCalf.position.set(0, -20 * scale, 0);
        leftCalf.castShadow = true;
        leftLegGroup.add(leftCalf);
        this.modelParts.leftCalf = leftCalf;
        
        // Calf muscle bulge
        const leftCalfMuscleGeometry = new THREE.SphereGeometry(3.8 * scale, 16, 16);
        const leftCalfMuscle = new THREE.Mesh(leftCalfMuscleGeometry, darkGrayMaterial);
        leftCalfMuscle.position.set(0, -3 * scale, -2 * scale);
        leftCalfMuscle.scale.set(0.8, 1.2, 0.7);
        leftCalf.add(leftCalfMuscle);
        
        // Ankle detail
        const leftAnkleGeometry = new THREE.SphereGeometry(2 * scale, 16, 16);
        const leftAnkle = new THREE.Mesh(leftAnkleGeometry, darkGrayMaterial);
        leftAnkle.position.set(0, -10 * scale, 0);
        leftAnkle.scale.set(1.5, 0.8, 1);
        leftCalf.add(leftAnkle);
        
        // Detailed foot
        const leftFootGroup = new THREE.Group();
        
        // Main foot shape
        const leftFootGeometry = new THREE.BoxGeometry(4 * scale, 2 * scale, 10 * scale);
        const leftFoot = new THREE.Mesh(leftFootGeometry, darkGrayMaterial);
        leftFoot.position.set(0, 0, 3 * scale);
        leftFootGroup.add(leftFoot);
        
        // Toe details
        const leftToesGeometry = new THREE.SphereGeometry(2 * scale, 16, 16);
        const leftToes = new THREE.Mesh(leftToesGeometry, darkGrayMaterial);
        leftToes.position.set(0, 0, 8 * scale);
        leftToes.scale.set(1, 0.8, 0.6);
        leftFootGroup.add(leftToes);
        
        leftFootGroup.position.set(0, -30 * scale, 0);
        leftLegGroup.add(leftFootGroup);
        
        // Position the left leg group
        leftLegGroup.position.set(6 * scale, 0, 0);
        this.modelGroup.add(leftLegGroup);
        
        // Create right leg group (mirror of left)
        const rightLegGroup = new THREE.Group();
        
        // Thigh with muscle definition
        const rightThighGeometry = new THREE.CylinderGeometry(4.5 * scale, 4 * scale, 20 * scale, 16);
        const rightThigh = new THREE.Mesh(rightThighGeometry, darkGrayMaterial);
        rightThigh.castShadow = true;
        rightLegGroup.add(rightThigh);
        this.modelParts.rightThigh = rightThigh;
        
        // Thigh muscle definition (quadriceps)
        const rightQuadGeometry = new THREE.SphereGeometry(4 * scale, 16, 16);
        const rightQuad = new THREE.Mesh(rightQuadGeometry, darkGrayMaterial);
        rightQuad.position.set(0, -3 * scale, 2 * scale);
        rightQuad.scale.set(0.8, 1.2, 0.7);
        rightThigh.add(rightQuad);
        
        // Knee detail
        const rightKneeGeometry = new THREE.SphereGeometry(2 * scale, 16, 16);
        const rightKnee = new THREE.Mesh(rightKneeGeometry, darkGrayMaterial);
        rightKnee.position.set(0, -10 * scale, 2 * scale);
        rightKnee.scale.set(1.5, 1, 1);
        rightThigh.add(rightKnee);
        
        // Calf with muscle definition
        const rightCalfGeometry = new THREE.CylinderGeometry(4 * scale, 3 * scale, 20 * scale, 16);
        const rightCalf = new THREE.Mesh(rightCalfGeometry, darkGrayMaterial);
        rightCalf.position.set(0, -20 * scale, 0);
        rightCalf.castShadow = true;
        rightLegGroup.add(rightCalf);
        this.modelParts.rightCalf = rightCalf;
        
        // Calf muscle bulge
        const rightCalfMuscleGeometry = new THREE.SphereGeometry(3.8 * scale, 16, 16);
        const rightCalfMuscle = new THREE.Mesh(rightCalfMuscleGeometry, darkGrayMaterial);
        rightCalfMuscle.position.set(0, -3 * scale, -2 * scale);
        rightCalfMuscle.scale.set(0.8, 1.2, 0.7);
        rightCalf.add(rightCalfMuscle);
        
        // Ankle detail
        const rightAnkleGeometry = new THREE.SphereGeometry(2 * scale, 16, 16);
        const rightAnkle = new THREE.Mesh(rightAnkleGeometry, darkGrayMaterial);
        rightAnkle.position.set(0, -10 * scale, 0);
        rightAnkle.scale.set(1.5, 0.8, 1);
        rightCalf.add(rightAnkle);
        
        // Detailed foot
        const rightFootGroup = new THREE.Group();
        
        // Main foot shape
        const rightFootGeometry = new THREE.BoxGeometry(4 * scale, 2 * scale, 10 * scale);
        const rightFoot = new THREE.Mesh(rightFootGeometry, darkGrayMaterial);
        rightFoot.position.set(0, 0, 3 * scale);
        rightFootGroup.add(rightFoot);
        
        // Toe details
        const rightToesGeometry = new THREE.SphereGeometry(2 * scale, 16, 16);
        const rightToes = new THREE.Mesh(rightToesGeometry, darkGrayMaterial);
        rightToes.position.set(0, 0, 8 * scale);
        rightToes.scale.set(1, 0.8, 0.6);
        rightFootGroup.add(rightToes);
        
        rightFootGroup.position.set(0, -30 * scale, 0);
        rightLegGroup.add(rightFootGroup);
        
        // Position the right leg group
        rightLegGroup.position.set(-6 * scale, 0, 0);
        this.modelGroup.add(rightLegGroup);
        
        // ===== ADDITIONAL DETAILS AND ACCESSORIES =====
        // Create detailed necklace with pendant
        const necklaceGroup = new THREE.Group();
        
        // Main necklace chain
        const necklaceGeometry = new THREE.TorusGeometry(6.5 * scale, 0.8 * scale, 8, 32);
        const necklace = new THREE.Mesh(necklaceGeometry, goldMaterial);
        necklace.rotation.x = Math.PI / 2;
        necklace.castShadow = true;
        necklaceGroup.add(necklace);
        
        // Create detailed pendant
        const pendantGroup = new THREE.Group();
        
        // Main pendant shape
        const pendantGeometry = new THREE.CylinderGeometry(2 * scale, 2 * scale, 0.5 * scale, 16);
        const pendant = new THREE.Mesh(pendantGeometry, goldMaterial);
        pendant.rotation.x = Math.PI / 2;
        pendantGroup.add(pendant);
        
        // Pendant gem
        const gemGeometry = new THREE.SphereGeometry(1 * scale, 16, 16);
        const gemMaterial = new THREE.MeshToonMaterial({
            color: 0x0066FF, // Blue gem
            emissive: 0x003399,
            emissiveIntensity: 0.5,
            flatShading: true
        });
        const gem = new THREE.Mesh(gemGeometry, gemMaterial);
        gem.position.z = 0.3 * scale;
        gem.scale.set(1, 1, 0.5);
        pendantGroup.add(gem);
        
        // Pendant decorative elements
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const decorGeometry = new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale);
            const decor = new THREE.Mesh(decorGeometry, goldMaterial);
            
            decor.position.set(
                Math.cos(angle) * 1.5 * scale,
                Math.sin(angle) * 1.5 * scale,
                0
            );
            
            pendantGroup.add(decor);
        }
        
        pendantGroup.position.set(0, -6.5 * scale, 0);
        necklaceGroup.add(pendantGroup);
        
        // Position the necklace group
        necklaceGroup.position.y = 42 * scale;
        this.modelGroup.add(necklaceGroup);
        
        // Create detailed sash with decorative patterns
        const sashGroup = new THREE.Group();
        
        // Main sash (flowing cloth)
        const sashCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 15 * scale, 6 * scale),
            new THREE.Vector3(2 * scale, 10 * scale, 8 * scale),
            new THREE.Vector3(3 * scale, 5 * scale, 9 * scale),
            new THREE.Vector3(2 * scale, 0, 8 * scale),
            new THREE.Vector3(0, -5 * scale, 7 * scale),
            new THREE.Vector3(-2 * scale, -10 * scale, 8 * scale),
            new THREE.Vector3(-1 * scale, -15 * scale, 7 * scale)
        ]);
        
        const sashGeometry = new THREE.TubeGeometry(sashCurve, 20, 2 * scale, 8, false);
        const sash = new THREE.Mesh(sashGeometry, yellowRobeMaterial);
        sashGroup.add(sash);
        
        // Sash decorative patterns
        for (let i = 0; i < 5; i++) {
            const patternGeometry = new THREE.BoxGeometry(4 * scale, 0.5 * scale, 0.5 * scale);
            const pattern = new THREE.Mesh(patternGeometry, goldMaterial);
            
            pattern.position.set(0, (10 - i * 6) * scale, 8 * scale);
            pattern.rotation.z = Math.PI / 12;
            
            sashGroup.add(pattern);
        }
        
        this.modelGroup.add(sashGroup);
        
        // Create detailed tattoos on arms
        // Left arm tattoo group
        const leftTattooGroup = new THREE.Group();
        
        // Create spiral pattern on left arm
        const spiralCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(15 * scale, 25 * scale, 3 * scale),
            new THREE.Vector3(17 * scale, 23 * scale, 3 * scale),
            new THREE.Vector3(16 * scale, 21 * scale, 3 * scale),
            new THREE.Vector3(14 * scale, 20 * scale, 3 * scale),
            new THREE.Vector3(13 * scale, 18 * scale, 3 * scale),
            new THREE.Vector3(14 * scale, 16 * scale, 3 * scale),
            new THREE.Vector3(16 * scale, 15 * scale, 3 * scale)
        ]);
        
        const spiralGeometry = new THREE.TubeGeometry(spiralCurve, 30, 0.5 * scale, 8, false);
        const spiralMaterial = new THREE.MeshToonMaterial({ 
            color: 0x000066,
            emissive: 0x000033,
            emissiveIntensity: 0.2,
            flatShading: true
        });
        const spiralTattoo = new THREE.Mesh(spiralGeometry, spiralMaterial);
        leftTattooGroup.add(spiralTattoo);
        
        // Add small decorative elements to the tattoo
        for (let i = 0; i < 5; i++) {
            const dotGeometry = new THREE.SphereGeometry(0.3 * scale, 8, 8);
            const dot = new THREE.Mesh(dotGeometry, spiralMaterial);
            
            // Position dots around the spiral
            const t = i / 5;
            const point = spiralCurve.getPoint(t);
            const tangent = spiralCurve.getTangent(t);
            
            // Position slightly offset from the main spiral
            dot.position.set(
                point.x + tangent.y * 1 * scale,
                point.y - tangent.x * 1 * scale,
                point.z
            );
            
            leftTattooGroup.add(dot);
        }
        
        this.modelGroup.add(leftTattooGroup);
        
        // Right arm symbolic tattoo
        const rightTattooGroup = new THREE.Group();
        
        // Create symbolic pattern (Buddhist symbol)
        const symbolCurve1 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-15 * scale, 25 * scale, 3 * scale),
            new THREE.Vector3(-17 * scale, 23 * scale, 3 * scale),
            new THREE.Vector3(-15 * scale, 21 * scale, 3 * scale),
            new THREE.Vector3(-13 * scale, 23 * scale, 3 * scale),
            new THREE.Vector3(-15 * scale, 25 * scale, 3 * scale)
        ]);
        
        const symbolGeometry1 = new THREE.TubeGeometry(symbolCurve1, 20, 0.5 * scale, 8, true);
        const symbolTattoo1 = new THREE.Mesh(symbolGeometry1, spiralMaterial);
        rightTattooGroup.add(symbolTattoo1);
        
        // Add vertical line
        const symbolCurve2 = new THREE.LineCurve3(
            new THREE.Vector3(-15 * scale, 25 * scale, 3 * scale),
            new THREE.Vector3(-15 * scale, 19 * scale, 3 * scale)
        );
        
        const symbolGeometry2 = new THREE.TubeGeometry(symbolCurve2, 10, 0.5 * scale, 8, false);
        const symbolTattoo2 = new THREE.Mesh(symbolGeometry2, spiralMaterial);
        rightTattooGroup.add(symbolTattoo2);
        
        // Add horizontal line
        const symbolCurve3 = new THREE.LineCurve3(
            new THREE.Vector3(-18 * scale, 22 * scale, 3 * scale),
            new THREE.Vector3(-12 * scale, 22 * scale, 3 * scale)
        );
        
        const symbolGeometry3 = new THREE.TubeGeometry(symbolCurve3, 10, 0.5 * scale, 8, false);
        const symbolTattoo3 = new THREE.Mesh(symbolGeometry3, spiralMaterial);
        rightTattooGroup.add(symbolTattoo3);
        
        this.modelGroup.add(rightTattooGroup);
        
        // Position the entire model
        this.modelGroup.position.y = 1.6; // Raise to stand on ground
        
        // Add model to scene
        this.scene.add(this.modelGroup);
        
        // Log to confirm player model was added
        console.log("Highly detailed Ghibli-style monk model created and added to scene:", this.modelGroup);
        
        return this.modelGroup;
    }
    
    updateAnimations(delta, playerState) {
        // Ghibli-style animations for the monk model
        if (playerState.isMoving()) {
            // Walking animation with Ghibli-style bouncy movement
            const walkSpeed = 5;
            const walkAmplitude = 0.1;
            const time = Date.now() * 0.01;
            
            // Animate legs with a more exaggerated Ghibli-style movement
            if (this.modelParts.leftThigh && this.modelParts.rightThigh) {
                // Thigh rotation for walking
                this.modelParts.leftThigh.rotation.x = Math.sin(time * walkSpeed) * 0.3;
                this.modelParts.rightThigh.rotation.x = -Math.sin(time * walkSpeed) * 0.3;
            }
            
            if (this.modelParts.leftCalf && this.modelParts.rightCalf) {
                // Calf rotation for walking - follows thigh with slight delay
                this.modelParts.leftCalf.rotation.x = Math.sin(time * walkSpeed - 0.3) * 0.2;
                this.modelParts.rightCalf.rotation.x = -Math.sin(time * walkSpeed - 0.3) * 0.2;
            }
            
            // Animate arms with Ghibli-style swinging
            if (this.modelParts.leftUpperArm && this.modelParts.rightUpperArm) {
                // Upper arm swing
                this.modelParts.leftUpperArm.rotation.x = -Math.sin(time * walkSpeed) * 0.4;
                this.modelParts.rightUpperArm.rotation.x = Math.sin(time * walkSpeed) * 0.4;
            }
            
            if (this.modelParts.leftForearm && this.modelParts.rightForearm) {
                // Forearm follows with slight bend
                this.modelParts.leftForearm.rotation.x = -Math.sin(time * walkSpeed) * 0.2 + 0.2;
                this.modelParts.rightForearm.rotation.x = Math.sin(time * walkSpeed) * 0.2 + 0.2;
            }
            
            // Ghibli-style body bounce
            if (this.modelGroup) {
                // Subtle up and down movement
                this.modelGroup.position.y = 1.6 + Math.abs(Math.sin(time * walkSpeed)) * 0.05;
            }
            
            // Head slight tilt for character personality
            if (this.modelParts.head) {
                this.modelParts.head.rotation.z = Math.sin(time * walkSpeed * 0.5) * 0.05;
                this.modelParts.head.rotation.y = Math.sin(time * walkSpeed * 0.3) * 0.1;
            }
            
        } else {
            // Idle animation - Ghibli characters often have subtle movements even when idle
            const idleSpeed = 1;
            const time = Date.now() * 0.001;
            
            // Reset walking animations
            if (this.modelParts.leftThigh && this.modelParts.rightThigh) {
                this.modelParts.leftThigh.rotation.x = 0;
                this.modelParts.rightThigh.rotation.x = 0;
            }
            
            if (this.modelParts.leftCalf && this.modelParts.rightCalf) {
                this.modelParts.leftCalf.rotation.x = 0;
                this.modelParts.rightCalf.rotation.x = 0;
            }
            
            // Subtle breathing animation
            if (this.modelParts.chest) {
                this.modelParts.chest.scale.y = 1 + Math.sin(time * idleSpeed) * 0.02;
                this.modelParts.chest.scale.z = 1 + Math.sin(time * idleSpeed) * 0.01;
            }
            
            // Subtle arm movement
            if (this.modelParts.leftUpperArm && this.modelParts.rightUpperArm) {
                this.modelParts.leftUpperArm.rotation.x = Math.sin(time * idleSpeed * 0.7) * 0.05;
                this.modelParts.rightUpperArm.rotation.x = -Math.sin(time * idleSpeed * 0.7) * 0.05;
            }
            
            // Subtle head movement - looking around occasionally
            if (this.modelParts.head) {
                this.modelParts.head.rotation.y = Math.sin(time * idleSpeed * 0.3) * 0.1;
                this.modelParts.head.rotation.z = Math.sin(time * idleSpeed * 0.5) * 0.03;
            }
            
            // Return model to base position
            if (this.modelGroup) {
                this.modelGroup.position.y = 1.6 + Math.sin(time * idleSpeed) * 0.01; // Very subtle up/down
            }
        }
        
        // Attack animation
        if (playerState.isAttacking()) {
            // Ghibli-style attack animation - more exaggerated and fluid
            const attackSpeed = 8;
            const time = Date.now() * 0.01;
            
            if (this.modelParts.rightUpperArm && this.modelParts.rightForearm) {
                // Exaggerated wind-up and follow-through
                this.modelParts.rightUpperArm.rotation.x = Math.sin(time * attackSpeed) * 0.8;
                this.modelParts.rightForearm.rotation.x = Math.sin(time * attackSpeed + 0.5) * 0.6 + 0.3;
                
                // Add some rotation for a more dynamic feel
                this.modelParts.rightUpperArm.rotation.z = -Math.PI / 12 + Math.sin(time * attackSpeed) * 0.2;
            }
            
            // Add torso rotation for weight shift
            if (this.modelParts.chest) {
                this.modelParts.chest.rotation.y = Math.sin(time * attackSpeed) * 0.15;
            }
        }
    }
    
    setPosition(position) {
        if (this.modelGroup) {
            this.modelGroup.position.copy(position);
        }
    }
    
    setRotation(rotation) {
        if (this.modelGroup) {
            this.modelGroup.rotation.y = rotation.y;
        }
    }
    
    // Left jab - quick straight punch with left hand
    createLeftPunchAnimation() {
        // Use our stored model parts for more precise animation
        if (!this.modelParts.leftUpperArm || !this.modelParts.leftForearm || !this.modelParts.leftHand) return;
        
        // Store original rotations
        const originalUpperArmRotation = this.modelParts.leftUpperArm.rotation.clone();
        const originalForearmRotation = this.modelParts.leftForearm.rotation.clone();
        const originalHandRotation = this.modelParts.leftHand.rotation.clone();
        
        // Create Ghibli-style punch animation sequence - more fluid and exaggerated
        const punchSequence = () => {
            // Quick wind up with Ghibli-style anticipation
            this.modelParts.leftUpperArm.rotation.z = Math.PI / 6; // Pull back slightly
            this.modelParts.leftUpperArm.rotation.y = -Math.PI / 12; // Rotate slightly
            this.modelParts.leftForearm.rotation.x = 0.3; // Bend elbow
            
            // After a short delay, punch forward with exaggerated motion
            setTimeout(() => {
                // Punch forward animation - straight jab with Ghibli-style follow-through
                this.modelParts.leftUpperArm.rotation.z = Math.PI / 3; // Extend forward
                this.modelParts.leftUpperArm.rotation.y = Math.PI / 24; // Rotate outward slightly
                this.modelParts.leftForearm.rotation.x = -0.2; // Extend elbow
                
                // Add slight rotation to chest for weight shift (Ghibli style)
                if (this.modelParts.chest) {
                    this.modelParts.chest.rotation.y = -Math.PI / 24;
                }
                
                // Create punch effect - blue color for left hand
                this.createPunchEffect('left', 0x4169e1); // Royal blue
                
                // Return to original position with Ghibli-style overshoot and settle
                setTimeout(() => {
                    // Slight overshoot
                    this.modelParts.leftUpperArm.rotation.z = originalUpperArmRotation.z - 0.1;
                    this.modelParts.leftForearm.rotation.x = originalForearmRotation.x + 0.1;
                    
                    // Then settle back to original
                    setTimeout(() => {
                        this.modelParts.leftUpperArm.rotation.copy(originalUpperArmRotation);
                        this.modelParts.leftForearm.rotation.copy(originalForearmRotation);
                        this.modelParts.leftHand.rotation.copy(originalHandRotation);
                        
                        if (this.modelParts.chest) {
                            this.modelParts.chest.rotation.y = 0;
                        }
                    }, 80);
                }, 100);
            }, 30);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Right cross - powerful straight punch with right hand
    createRightPunchAnimation() {
        // Use our stored model parts for more precise animation
        if (!this.modelParts.rightUpperArm || !this.modelParts.rightForearm || !this.modelParts.rightHand) return;
        
        // Store original rotations
        const originalUpperArmRotation = this.modelParts.rightUpperArm.rotation.clone();
        const originalForearmRotation = this.modelParts.rightForearm.rotation.clone();
        const originalHandRotation = this.modelParts.rightHand.rotation.clone();
        const originalChestRotation = this.modelParts.chest ? this.modelParts.chest.rotation.clone() : null;
        
        // Create Ghibli-style punch animation sequence - more fluid and exaggerated
        const punchSequence = () => {
            // Wind up animation with Ghibli-style anticipation
            this.modelParts.rightUpperArm.rotation.z = -Math.PI / 5; // Pull back
            this.modelParts.rightUpperArm.rotation.y = Math.PI / 12; // Rotate slightly
            this.modelParts.rightForearm.rotation.x = 0.4; // Bend elbow
            
            // Rotate chest for weight shift (Ghibli style emphasizes weight and momentum)
            if (this.modelParts.chest) {
                this.modelParts.chest.rotation.y = -Math.PI / 12;
            }
            
            // After a short delay, punch forward with exaggerated motion
            setTimeout(() => {
                // Punch forward animation - cross punch with Ghibli-style follow-through
                this.modelParts.rightUpperArm.rotation.z = -Math.PI / 2.5; // Extend further forward
                this.modelParts.rightUpperArm.rotation.y = -Math.PI / 24; // Rotate inward slightly
                this.modelParts.rightForearm.rotation.x = -0.3; // Extend elbow
                
                // Rotate chest for weight shift (Ghibli style)
                if (this.modelParts.chest) {
                    this.modelParts.chest.rotation.y = Math.PI / 10;
                }
                
                // Create punch effect - red color for right hand
                this.createPunchEffect('right', 0xff4500); // OrangeRed
                
                // Return to original position with Ghibli-style overshoot and settle
                setTimeout(() => {
                    // Slight overshoot
                    this.modelParts.rightUpperArm.rotation.z = originalUpperArmRotation.z + 0.1;
                    this.modelParts.rightForearm.rotation.x = originalForearmRotation.x + 0.1;
                    
                    if (this.modelParts.chest) {
                        this.modelParts.chest.rotation.y = -Math.PI / 24;
                    }
                    
                    // Then settle back to original
                    setTimeout(() => {
                        this.modelParts.rightUpperArm.rotation.copy(originalUpperArmRotation);
                        this.modelParts.rightForearm.rotation.copy(originalForearmRotation);
                        this.modelParts.rightHand.rotation.copy(originalHandRotation);
                        
                        if (this.modelParts.chest && originalChestRotation) {
                            this.modelParts.chest.rotation.copy(originalChestRotation);
                        }
                    }, 100);
                }, 150);
            }, 50);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Left hook - circular punch with left hand
    createLeftHookAnimation() {
        // Use our stored model parts for more precise animation
        if (!this.modelParts.leftUpperArm || !this.modelParts.leftForearm || !this.modelParts.leftHand) return;
        
        // Store original rotations
        const originalUpperArmRotation = this.modelParts.leftUpperArm.rotation.clone();
        const originalForearmRotation = this.modelParts.leftForearm.rotation.clone();
        const originalHandRotation = this.modelParts.leftHand.rotation.clone();
        const originalChestRotation = this.modelParts.chest ? this.modelParts.chest.rotation.clone() : null;
        
        // Create Ghibli-style punch animation sequence - more fluid and exaggerated
        const punchSequence = () => {
            // Wind up animation with Ghibli-style anticipation
            if (this.modelParts.chest) {
                this.modelParts.chest.rotation.y = -Math.PI / 8; // Rotate torso right
            }
            
            // Pull arm back and to the side with exaggerated motion
            this.modelParts.leftUpperArm.rotation.z = Math.PI / 8;
            this.modelParts.leftUpperArm.rotation.y = -Math.PI / 6; // More exaggerated for Ghibli style
            this.modelParts.leftForearm.rotation.x = 0.5; // Bend elbow
            
            // After a short delay, execute hook with fluid motion
            setTimeout(() => {
                // Hook punch animation - circular motion with Ghibli-style exaggeration
                this.modelParts.leftUpperArm.rotation.z = Math.PI / 2.5; // Extend arm
                this.modelParts.leftUpperArm.rotation.y = Math.PI / 4; // Exaggerated swing from side
                this.modelParts.leftForearm.rotation.x = 0.2; // Slight bend
                
                if (this.modelParts.chest) {
                    this.modelParts.chest.rotation.y = Math.PI / 6; // Exaggerated torso rotation
                }
                
                // Create punch effect - purple color for hook
                this.createPunchEffect('left-hook', 0x9932cc); // DarkOrchid
                
                // Return to original position with Ghibli-style overshoot and settle
                setTimeout(() => {
                    // Slight overshoot
                    this.modelParts.leftUpperArm.rotation.z = originalUpperArmRotation.z - 0.1;
                    this.modelParts.leftUpperArm.rotation.y = -Math.PI / 12;
                    
                    if (this.modelParts.chest) {
                        this.modelParts.chest.rotation.y = -Math.PI / 16;
                    }
                    
                    // Then settle back to original
                    setTimeout(() => {
                        this.modelParts.leftUpperArm.rotation.copy(originalUpperArmRotation);
                        this.modelParts.leftForearm.rotation.copy(originalForearmRotation);
                        this.modelParts.leftHand.rotation.copy(originalHandRotation);
                        
                        if (this.modelParts.chest && originalChestRotation) {
                            this.modelParts.chest.rotation.copy(originalChestRotation);
                        }
                    }, 120);
                }, 200);
            }, 70);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Heavy uppercut - powerful upward punch with right hand
    createHeavyPunchAnimation() {
        // Use our stored model parts for more precise animation
        if (!this.modelParts.rightUpperArm || !this.modelParts.rightForearm || !this.modelParts.rightHand) return;
        
        // Store original positions and rotations
        const originalUpperArmRotation = this.modelParts.rightUpperArm.rotation.clone();
        const originalForearmRotation = this.modelParts.rightForearm.rotation.clone();
        const originalHandRotation = this.modelParts.rightHand.rotation.clone();
        const originalChestRotation = this.modelParts.chest ? this.modelParts.chest.rotation.clone() : null;
        const originalChestPosition = this.modelParts.chest ? this.modelParts.chest.position.clone() : null;
        const originalModelPosition = this.modelGroup.position.clone();
        
        // Create Ghibli-style punch animation sequence - highly exaggerated and dynamic
        const punchSequence = () => {
            // Wind up animation with Ghibli-style deep crouch and anticipation
            if (this.modelParts.chest) {
                this.modelParts.chest.position.y -= 0.3; // Lower torso more dramatically
                this.modelParts.chest.rotation.x = Math.PI / 8; // Lean forward more
            }
            
            // Lower the entire model for a deeper crouch
            this.modelGroup.position.y -= 0.2;
            
            // Pull arm down and back with exaggerated motion
            this.modelParts.rightUpperArm.rotation.x = Math.PI / 4; // Pull down more
            this.modelParts.rightUpperArm.rotation.z = -Math.PI / 6; // Pull back
            this.modelParts.rightForearm.rotation.x = 0.7; // Bend elbow more
            
            // After a delay, execute uppercut with explosive motion
            setTimeout(() => {
                // Uppercut animation - dramatic upward motion (Ghibli style)
                this.modelParts.rightUpperArm.rotation.x = -Math.PI / 3; // Swing upward more
                this.modelParts.rightUpperArm.rotation.z = -Math.PI / 2; // Extend arm
                this.modelParts.rightForearm.rotation.x = -0.3; // Extend elbow
                
                if (this.modelParts.chest) {
                    this.modelParts.chest.position.y += 0.5; // Rise up more dramatically
                    this.modelParts.chest.rotation.x = -Math.PI / 6; // Lean back more
                }
                
                // Raise the entire model for a dramatic upward motion
                this.modelGroup.position.y += 0.4; // Exaggerated rise
                
                // Create heavy punch effect - fiery red/orange for uppercut
                this.createHeavyPunchEffect();
                
                // Return to original position with Ghibli-style overshoot and settle
                setTimeout(() => {
                    // Slight overshoot
                    this.modelParts.rightUpperArm.rotation.x = originalUpperArmRotation.x + 0.2;
                    this.modelGroup.position.y = originalModelPosition.y - 0.1;
                    
                    if (this.modelParts.chest) {
                        this.modelParts.chest.rotation.x = -Math.PI / 20;
                    }
                    
                    // Then settle back to original
                    setTimeout(() => {
                        this.modelParts.rightUpperArm.rotation.copy(originalUpperArmRotation);
                        this.modelParts.rightForearm.rotation.copy(originalForearmRotation);
                        this.modelParts.rightHand.rotation.copy(originalHandRotation);
                        
                        if (this.modelParts.chest) {
                            if (originalChestRotation) this.modelParts.chest.rotation.copy(originalChestRotation);
                            if (originalChestPosition) this.modelParts.chest.position.copy(originalChestPosition);
                        }
                        
                        this.modelGroup.position.copy(originalModelPosition);
                    }, 150);
                }, 300);
            }, 100);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Ghibli-style punch effect for normal punches
    createPunchEffect(hand, color) {
        // Calculate position in front of the player based on hand
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.modelGroup.rotation);
        let sideOffset = 0;
        let heightOffset = 0;
        
        // Adjust position based on which hand is punching
        if (hand === 'left') {
            sideOffset = -0.3;
            // Get actual hand position if available
            if (this.modelParts.leftHand) {
                heightOffset = this.modelParts.leftHand.position.y * 0.05;
            } else {
                heightOffset = 0.6;
            }
        } else if (hand === 'right') {
            sideOffset = 0.3;
            // Get actual hand position if available
            if (this.modelParts.rightHand) {
                heightOffset = this.modelParts.rightHand.position.y * 0.05;
            } else {
                heightOffset = 0.6;
            }
        } else if (hand === 'left-hook') {
            sideOffset = -0.4;
            // Adjust direction for hook punch
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8);
            // Get actual hand position if available
            if (this.modelParts.leftHand) {
                heightOffset = this.modelParts.leftHand.position.y * 0.05;
            } else {
                heightOffset = 0.6;
            }
        }
        
        // Calculate final punch position
        const punchPosition = new THREE.Vector3(
            this.modelGroup.position.x + direction.x * 1.2 + (direction.z * sideOffset),
            this.modelGroup.position.y + heightOffset, // At actual arm height
            this.modelGroup.position.z + direction.z * 1.2 - (direction.x * sideOffset)
        );
        
        // Create Ghibli-style impact burst (flatter, more stylized)
        // Main impact shape - flattened sphere for Ghibli-style "squash"
        const punchGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const punchMesh = new THREE.Mesh(
            punchGeometry,
            new THREE.MeshToonMaterial({
                color: color,
                transparent: true,
                opacity: 0.9,
                flatShading: true
            })
        );
        punchMesh.position.copy(punchPosition);
        punchMesh.scale.set(1.0, 0.6, 1.0); // Flatten for Ghibli-style impact
        
        // Add to scene
        this.scene.add(punchMesh);
        
        // Create Ghibli-style impact rings (more stylized)
        const rings = [];
        const ringColors = [0xFFFFFF, color, 0xFFFFFF]; // Alternating colors
        
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(0.2 + (i * 0.15), 0.3 + (i * 0.15), 24);
            const ringMaterial = new THREE.MeshToonMaterial({
                color: ringColors[i],
                transparent: true,
                opacity: 0.8 - (i * 0.1),
                side: THREE.DoubleSide,
                flatShading: true
            });
            
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.position.copy(punchPosition);
            ringMesh.lookAt(this.modelGroup.position); // Orient ring to face player
            
            // Add ring to scene
            this.scene.add(ringMesh);
            rings.push({
                mesh: ringMesh,
                geometry: ringGeometry,
                material: ringMaterial,
                initialScale: 1.0
            });
        }
        
        // Create Ghibli-style impact lines (thicker, fewer, more stylized)
        const impactLines = [];
        const numLines = 6; // Fewer lines for cleaner look
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const lineDirection = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle) * 0.7, // Flatten vertically for Ghibli style
                0
            ).applyEuler(new THREE.Euler(0, this.modelGroup.rotation.y, 0));
            
            // Thicker lines for Ghibli style
            const lineGeometry = new THREE.CylinderGeometry(0.05, 0.02, 0.5, 4);
            const lineMaterial = new THREE.MeshToonMaterial({
                color: color,
                transparent: true,
                opacity: 0.9,
                flatShading: true
            });
            
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            
            // Position and rotate line
            lineMesh.position.copy(punchPosition);
            lineMesh.position.add(lineDirection.multiplyScalar(0.3));
            
            // Rotate to point outward
            lineMesh.lookAt(punchPosition.clone().add(lineDirection));
            lineMesh.rotateX(Math.PI / 2);
            
            // Add to scene and store reference
            this.scene.add(lineMesh);
            impactLines.push({
                mesh: lineMesh,
                direction: lineDirection.normalize(),
                geometry: lineGeometry,
                material: lineMaterial,
                speed: 0.15 + Math.random() * 0.1 // Varied speeds for more dynamic feel
            });
        }
        
        // Create Ghibli-style impact stars (small, bright points)
        const stars = [];
        const numStars = 8;
        
        for (let i = 0; i < numStars; i++) {
            // Random direction with slight upward bias (Ghibli style)
            const angle = Math.random() * Math.PI * 2;
            const starDirection = new THREE.Vector3(
                Math.cos(angle) * (0.5 + Math.random() * 0.5),
                0.2 + Math.random() * 0.8, // Upward bias
                Math.sin(angle) * (0.5 + Math.random() * 0.5)
            ).normalize();
            
            // Create small bright star
            const starGeometry = new THREE.OctahedronGeometry(0.05 + Math.random() * 0.05, 0);
            const starMaterial = new THREE.MeshToonMaterial({
                color: 0xFFFFFF, // White stars
                emissive: color,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.9,
                flatShading: true
            });
            
            const starMesh = new THREE.Mesh(starGeometry, starMaterial);
            starMesh.position.copy(punchPosition);
            
            // Add to scene and store reference
            this.scene.add(starMesh);
            stars.push({
                mesh: starMesh,
                direction: starDirection,
                geometry: starGeometry,
                material: starMaterial,
                speed: 0.1 + Math.random() * 0.2,
                rotationSpeed: Math.random() * 0.2
            });
        }
        
        // Create text effect ("POW", "BAM", etc.) - very Ghibli-style
        let impactText = null;
        
        // Only add text for certain punches (random)
        if (Math.random() > 0.5) {
            // Choose a random impact text
            const textOptions = ["POW!", "BAM!", "WHAM!", "THWACK!"];
            const textValue = textOptions[Math.floor(Math.random() * textOptions.length)];
            
            // Create text sprite
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 128;
            
            // Draw text with cartoon style
            context.fillStyle = '#FFFFFF';
            context.strokeStyle = '#000000';
            context.lineWidth = 8;
            context.font = 'bold 80px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.strokeText(textValue, 128, 64);
            context.fillText(textValue, 128, 64);
            
            // Create sprite from canvas
            const textTexture = new THREE.CanvasTexture(canvas);
            const textMaterial = new THREE.SpriteMaterial({
                map: textTexture,
                transparent: true,
                opacity: 0
            });
            
            impactText = new THREE.Sprite(textMaterial);
            impactText.position.copy(punchPosition);
            impactText.position.y += 0.3; // Position above impact
            impactText.scale.set(1.0, 0.5, 1.0);
            
            this.scene.add(impactText);
        }
        
        // Animate the Ghibli-style punch effect
        let mainScale = 1.0;
        let mainOpacity = 0.9;
        let time = 0;
        
        const animatePunch = () => {
            time += 0.05;
            
            // Update main impact effect with Ghibli-style "squash and stretch"
            if (time < 0.2) {
                // Initial impact squash
                mainScale = 1.2;
                punchMesh.scale.set(mainScale * 1.2, mainScale * 0.5, mainScale * 1.2);
            } else {
                // Expand and fade
                mainScale += 0.15;
                mainOpacity -= 0.06;
                punchMesh.scale.set(mainScale * 1.0, mainScale * 0.6, mainScale * 1.0);
                punchMesh.material.opacity = mainOpacity;
            }
            
            // Update rings with Ghibli-style pulsing
            rings.forEach((ring, index) => {
                const pulseScale = ring.initialScale + Math.sin(time * 3 + index) * 0.1;
                const expandScale = ring.initialScale + time * 0.8;
                
                ring.mesh.scale.set(expandScale, expandScale, expandScale);
                ring.material.opacity = Math.max(0, 0.8 - (time * 0.2));
            });
            
            // Update impact lines with Ghibli-style movement
            impactLines.forEach(line => {
                // Move line outward with easing
                line.mesh.position.add(line.direction.clone().multiplyScalar(line.speed * (1 - time * 0.3)));
                
                // Fade out
                line.material.opacity = Math.max(0, 0.9 - time * 0.3);
            });
            
            // Update stars with Ghibli-style movement
            stars.forEach(star => {
                // Move star outward with slight arc
                star.direction.y -= 0.01; // Gravity effect
                star.mesh.position.add(star.direction.clone().multiplyScalar(star.speed));
                
                // Rotate star for twinkle effect
                star.mesh.rotation.x += star.rotationSpeed;
                star.mesh.rotation.y += star.rotationSpeed;
                
                // Fade out
                star.material.opacity = Math.max(0, 0.9 - time * 0.2);
            });
            
            // Animate text if present
            if (impactText) {
                if (time < 0.2) {
                    // Fade in and grow
                    impactText.material.opacity = time * 5;
                    impactText.scale.set(time * 5, time * 2.5, 1.0);
                } else if (time < 0.8) {
                    // Hold
                    impactText.material.opacity = 1.0;
                    impactText.scale.set(1.0, 0.5, 1.0);
                } else {
                    // Fade out
                    impactText.material.opacity = Math.max(0, 1.0 - (time - 0.8) * 2);
                }
            }
            
            // Continue animation until main effect is nearly invisible
            if (mainOpacity > 0) {
                requestAnimationFrame(animatePunch);
            } else {
                // Remove all effects from scene
                this.scene.remove(punchMesh);
                
                rings.forEach(ring => {
                    this.scene.remove(ring.mesh);
                    ring.geometry.dispose();
                    ring.material.dispose();
                });
                
                impactLines.forEach(line => {
                    this.scene.remove(line.mesh);
                    line.geometry.dispose();
                    line.material.dispose();
                });
                
                stars.forEach(star => {
                    this.scene.remove(star.mesh);
                    star.geometry.dispose();
                    star.material.dispose();
                });
                
                if (impactText) {
                    this.scene.remove(impactText);
                    impactText.material.map.dispose();
                    impactText.material.dispose();
                }
                
                // Dispose geometries and materials
                punchGeometry.dispose();
                punchMesh.material.dispose();
            }
        };
        
        // Start animation
        animatePunch();
    }
    
    // Special effect for the heavy uppercut (combo finisher) - Ghibli style
    createHeavyPunchEffect() {
        // Calculate position in front of the player
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.modelGroup.rotation);
        
        // Get actual hand position if available
        let heightOffset = 0.8;
        if (this.modelParts.rightHand) {
            heightOffset = this.modelParts.rightHand.position.y * 0.05 + 0.2; // Higher for uppercut
        }
        
        const punchPosition = new THREE.Vector3(
            this.modelGroup.position.x + direction.x * 1.3 + (direction.z * 0.3),
            this.modelGroup.position.y + heightOffset,
            this.modelGroup.position.z + direction.z * 1.3 - (direction.x * 0.3)
        );
        
        // Create Ghibli-style explosion effect (larger, more dramatic)
        // Main impact burst - stylized explosion shape
        const burstGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const burstMaterial = new THREE.MeshToonMaterial({
            color: 0xff3300, // Fiery orange-red
            emissive: 0xff5500,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9,
            flatShading: true
        });
        
        const burstMesh = new THREE.Mesh(burstGeometry, burstMaterial);
        burstMesh.position.copy(punchPosition);
        burstMesh.scale.set(1.0, 1.2, 1.0); // Slightly elongated for upward explosion
        
        // Add to scene
        this.scene.add(burstMesh);
        
        // Create Ghibli-style shockwave rings (more stylized, multiple layers)
        const rings = [];
        const ringColors = [0xffff00, 0xff7700, 0xff3300]; // Yellow to orange to red
        
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(0.3 + (i * 0.2), 0.5 + (i * 0.2), 32);
            const ringMaterial = new THREE.MeshToonMaterial({
                color: ringColors[i],
                transparent: true,
                opacity: 0.9 - (i * 0.1),
                side: THREE.DoubleSide,
                flatShading: true
            });
            
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.position.copy(punchPosition);
            ringMesh.lookAt(this.modelGroup.position);
            
            // Add to scene and store reference
            this.scene.add(ringMesh);
            rings.push({
                mesh: ringMesh,
                geometry: ringGeometry,
                material: ringMaterial,
                initialScale: 1.0 + (i * 0.3)
            });
        }
        
        // Create vertical energy column (Ghibli-style power effect)
        const columnGeometry = new THREE.CylinderGeometry(0.2, 0.5, 2.0, 16);
        const columnMaterial = new THREE.MeshToonMaterial({
            color: 0xffff00, // Bright yellow
            emissive: 0xff9900,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7,
            flatShading: true
        });
        
        const columnMesh = new THREE.Mesh(columnGeometry, columnMaterial);
        columnMesh.position.copy(punchPosition);
        columnMesh.position.y += 0.8; // Position above impact point
        
        // Add to scene
        this.scene.add(columnMesh);
        
        // Create Ghibli-style fire particles (more stylized, varied shapes)
        const particles = [];
        const particleCount = 25; // More particles for more dramatic effect
        
        // Particle shapes for variety
        const particleShapes = [
            new THREE.TetrahedronGeometry(1, 0), // Triangular
            new THREE.OctahedronGeometry(1, 0),  // Diamond
            new THREE.IcosahedronGeometry(1, 0)  // More spherical
        ];
        
        for (let i = 0; i < particleCount; i++) {
            // Random direction with strong upward bias (Ghibli style)
            const angle = Math.random() * Math.PI * 2;
            const particleDirection = new THREE.Vector3(
                Math.cos(angle) * (0.5 + Math.random() * 0.5),
                0.7 + Math.random() * 0.7, // Strong upward bias
                Math.sin(angle) * (0.5 + Math.random() * 0.5)
            ).normalize();
            
            // Create particle with random shape
            const size = 0.05 + Math.random() * 0.15;
            const shapeIndex = Math.floor(Math.random() * particleShapes.length);
            const particleGeometry = particleShapes[shapeIndex].clone();
            particleGeometry.scale(size, size, size);
            
            // Random color from yellow to red (Ghibli-style fire colors)
            const colorValue = Math.random();
            let particleColor;
            if (colorValue < 0.3) {
                particleColor = 0xffff00; // Yellow
            } else if (colorValue < 0.6) {
                particleColor = 0xff9900; // Orange
            } else {
                particleColor = 0xff3300; // Red
            }
            
            const particleMaterial = new THREE.MeshToonMaterial({
                color: particleColor,
                emissive: particleColor,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.9,
                flatShading: true
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position at punch point
            particle.position.copy(punchPosition);
            
            // Random rotation for variety
            particle.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            // Add to scene and store reference
            this.scene.add(particle);
            particles.push({
                mesh: particle,
                direction: particleDirection,
                speed: 0.08 + Math.random() * 0.2, // Faster for more dramatic effect
                geometry: particleGeometry,
                material: particleMaterial,
                gravity: 0.002 + Math.random() * 0.001, // Less gravity for longer hang time
                rotationSpeed: new THREE.Vector3(
                    Math.random() * 0.2 - 0.1,
                    Math.random() * 0.2 - 0.1,
                    Math.random() * 0.2 - 0.1
                )
            });
        }
        
        // Create Ghibli-style impact lines (thicker, more varied)
        const impactLines = [];
        const numLines = 16; // More lines for more dramatic effect
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const lineDirection = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle) * 0.8, // Slightly flattened for Ghibli style
                0
            ).applyEuler(new THREE.Euler(0, this.modelGroup.rotation.y, 0));
            
            // Varied thickness and length for Ghibli style
            const thickness = 0.03 + Math.random() * 0.03;
            const length = 0.5 + Math.random() * 0.3;
            
            const lineGeometry = new THREE.CylinderGeometry(thickness, thickness * 0.5, length, 4);
            const lineMaterial = new THREE.MeshToonMaterial({
                color: 0xff5500,
                transparent: true,
                opacity: 0.9,
                flatShading: true
            });
            
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            
            // Position and rotate line
            lineMesh.position.copy(punchPosition);
            lineMesh.position.add(lineDirection.multiplyScalar(0.4));
            
            // Rotate to point outward
            lineMesh.lookAt(punchPosition.clone().add(lineDirection));
            lineMesh.rotateX(Math.PI / 2);
            
            // Add to scene and store reference
            this.scene.add(lineMesh);
            impactLines.push({
                mesh: lineMesh,
                direction: lineDirection.normalize(),
                geometry: lineGeometry,
                material: lineMaterial,
                speed: 0.15 + Math.random() * 0.1
            });
        }
        
        // Create dramatic text effect ("BOOM!", "KAPOW!", etc.) - Ghibli style
        let impactText = null;
        
        // Choose a random impact text
        const textOptions = ["BOOM!", "KAPOW!", "WHAM!", "KABOOM!"];
        const textValue = textOptions[Math.floor(Math.random() * textOptions.length)];
        
        // Create text sprite
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        // Draw text with dramatic Ghibli style
        context.fillStyle = '#FFFF00'; // Yellow fill
        context.strokeStyle = '#FF3300'; // Red outline
        context.lineWidth = 16;
        context.font = 'bold 120px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeText(textValue, 256, 128);
        context.fillText(textValue, 256, 128);
        
        // Add second outline for more dramatic effect
        context.strokeStyle = '#000000';
        context.lineWidth = 8;
        context.strokeText(textValue, 256, 128);
        
        // Create sprite from canvas
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.SpriteMaterial({
            map: textTexture,
            transparent: true,
            opacity: 0
        });
        
        impactText = new THREE.Sprite(textMaterial);
        impactText.position.copy(punchPosition);
        impactText.position.y += 0.5; // Position above impact
        impactText.scale.set(2.0, 1.0, 1.0); // Larger for heavy punch
        
        this.scene.add(impactText);
        
        // Create ground impact effect (Ghibli-style ground crack)
        const groundPosition = new THREE.Vector3(
            punchPosition.x,
            this.modelGroup.position.y, // At ground level
            punchPosition.z
        );
        
        // Create ground shockwave
        const groundRingGeometry = new THREE.RingGeometry(0.2, 0.8, 32);
        const groundRingMaterial = new THREE.MeshToonMaterial({
            color: 0xff7700,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            flatShading: true
        });
        
        const groundRing = new THREE.Mesh(groundRingGeometry, groundRingMaterial);
        groundRing.position.copy(groundPosition);
        groundRing.position.y += 0.01; // Slightly above ground
        groundRing.rotation.x = Math.PI / 2; // Flat on ground
        
        this.scene.add(groundRing);
        
        // Animate the Ghibli-style heavy punch effect
        let mainScale = 1.0;
        let mainOpacity = 0.9;
        let columnScale = 1.0;
        let time = 0;
        
        const animateHeavyPunch = () => {
            time += 0.05;
            
            // Update main burst effect with Ghibli-style "squash and stretch"
            if (time < 0.2) {
                // Initial impact squash
                mainScale = 1.3;
                burstMesh.scale.set(mainScale * 1.2, mainScale * 0.8, mainScale * 1.2);
            } else {
                // Expand and fade
                mainScale += 0.2;
                mainOpacity -= 0.04;
                burstMesh.scale.set(mainScale, mainScale * 1.2, mainScale);
                burstMaterial.opacity = mainOpacity;
            }
            
            // Update energy column with Ghibli-style pulsing and stretching
            columnScale += 0.15;
            columnMesh.scale.set(1.0, columnScale, 1.0); // Stretch upward
            columnMesh.position.y += 0.1; // Move upward
            columnMaterial.opacity = Math.max(0, 0.7 - (time * 0.15));
            
            // Update rings with Ghibli-style expansion
            rings.forEach((ring, index) => {
                const expandScale = ring.initialScale + time * 1.0;
                ring.mesh.scale.set(expandScale, expandScale, expandScale);
                ring.material.opacity = Math.max(0, 0.9 - (time * 0.2));
            });
            
            // Update particles with Ghibli-style movement
            particles.forEach(particle => {
                // Apply reduced gravity (Ghibli style often defies physics slightly)
                particle.direction.y -= particle.gravity;
                
                // Move particle
                particle.mesh.position.add(
                    particle.direction.clone().multiplyScalar(particle.speed * (1 - time * 0.1))
                );
                
                // Rotate particle
                particle.mesh.rotation.x += particle.rotationSpeed.x;
                particle.mesh.rotation.y += particle.rotationSpeed.y;
                particle.mesh.rotation.z += particle.rotationSpeed.z;
                
                // Fade out
                particle.material.opacity = Math.max(0, 0.9 - time * 0.15);
                
                // Scale up slightly for explosion effect
                if (time < 0.3) {
                    particle.mesh.scale.multiplyScalar(1.03);
                } else {
                    particle.mesh.scale.multiplyScalar(0.98);
                }
            });
            
            // Update impact lines with Ghibli-style movement
            impactLines.forEach(line => {
                // Move line outward with easing
                line.mesh.position.add(line.direction.clone().multiplyScalar(line.speed * (1 - time * 0.2)));
                
                // Fade out
                line.material.opacity = Math.max(0, 0.9 - time * 0.2);
            });
            
            // Update ground effect
            groundRing.scale.set(1.0 + time * 1.5, 1.0 + time * 1.5, 1.0);
            groundRingMaterial.opacity = Math.max(0, 0.7 - time * 0.2);
            
            // Animate text with Ghibli-style dramatic appearance
            if (time < 0.2) {
                // Fade in and grow
                impactText.material.opacity = time * 5;
                impactText.scale.set(time * 10, time * 5, 1.0);
            } else if (time < 1.0) {
                // Hold with slight pulsing
                const pulse = 1.0 + Math.sin(time * 10) * 0.05;
                impactText.scale.set(2.0 * pulse, 1.0 * pulse, 1.0);
                impactText.material.opacity = 1.0;
            } else {
                // Fade out
                impactText.material.opacity = Math.max(0, 1.0 - (time - 1.0) * 2);
            }
            
            // Continue animation until main effect is nearly invisible
            if (mainOpacity > 0) {
                requestAnimationFrame(animateHeavyPunch);
            } else {
                // Remove all effects from scene
                this.scene.remove(burstMesh);
                this.scene.remove(columnMesh);
                this.scene.remove(groundRing);
                
                rings.forEach(ring => {
                    this.scene.remove(ring.mesh);
                    ring.geometry.dispose();
                    ring.material.dispose();
                });
                
                particles.forEach(particle => {
                    this.scene.remove(particle.mesh);
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
                
                impactLines.forEach(line => {
                    this.scene.remove(line.mesh);
                    line.geometry.dispose();
                    line.material.dispose();
                });
                
                this.scene.remove(impactText);
                impactText.material.map.dispose();
                impactText.material.dispose();
                
                // Dispose geometries and materials
                burstGeometry.dispose();
                burstMaterial.dispose();
                columnGeometry.dispose();
                columnMaterial.dispose();
                groundRingGeometry.dispose();
                groundRingMaterial.dispose();
            }
        };
        
        // Start animation
        animateHeavyPunch();
    }
    
    createAttackEffect(direction) {
        // Create a simple attack effect (a cone)
        const attackGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const attackMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        
        const attackMesh = new THREE.Mesh(attackGeometry, attackMaterial);
        
        // Position and rotate attack effect
        attackMesh.position.copy(this.modelGroup.position);
        attackMesh.position.y += 1;
        attackMesh.rotation.x = Math.PI / 2;
        attackMesh.rotation.y = this.modelGroup.rotation.y;
        
        // Move attack effect forward
        attackMesh.position.x += direction.x * 1.5;
        attackMesh.position.z += direction.z * 1.5;
        
        // Add to scene
        this.scene.add(attackMesh);
        
        // Remove after delay
        setTimeout(() => {
            this.scene.remove(attackMesh);
            attackGeometry.dispose();
            attackMaterial.dispose();
        }, 300);
    }
    
    createKnockbackEffect(position) {
        // Create a shockwave effect at the knockback point
        const ringGeometry = new THREE.RingGeometry(0.5, 0.7, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.position.y += 0.1; // Slightly above ground
        ring.rotation.x = Math.PI / 2; // Flat on ground
        
        this.scene.add(ring);
        
        // Animate the shockwave
        let scale = 1.0;
        let opacity = 0.7;
        
        const animateShockwave = () => {
            scale += 0.2;
            opacity -= 0.03;
            
            ring.scale.set(scale, scale, scale);
            ringMaterial.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateShockwave);
            } else {
                this.scene.remove(ring);
                ringGeometry.dispose();
                ringMaterial.dispose();
            }
        };
        
        animateShockwave();
    }
    
    getModelGroup() {
        return this.modelGroup;
    }
}
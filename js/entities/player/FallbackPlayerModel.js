/**
 * FallbackPlayerModel.js
 * Provides a simple geometric fallback model when the 3D model fails to load
 */

import * as THREE from 'three';
import { IPlayerModel } from './PlayerInterface.js';

export class FallbackPlayerModel extends IPlayerModel {
    constructor(scene) {
        super();
        
        this.scene = scene;
        this.modelGroup = null;
    }
    
    createModel() {
        console.warn("Using fallback geometric model");
        
        // Create a group for the player if it doesn't exist
        if (!this.modelGroup) {
            this.modelGroup = new THREE.Group();
        }
        
        // Create body (cube)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create arms (cylinders)
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 0.6, 0);
        leftArm.rotation.z = Math.PI / 2;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 0.6, 0);
        rightArm.rotation.z = -Math.PI / 2;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Create legs (cylinders)
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.25, 0, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.25, 0, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
        
        // Add model to scene
        this.scene.add(this.modelGroup);
        
        return this.modelGroup;
    }
    
    updateAnimations(delta, playerState) {
        // Only proceed if we have a model group with the expected children
        if (!this.modelGroup || this.modelGroup.children.length < 6) return;
        
        // Simple animations for the fallback geometric model
        if (playerState.isMoving()) {
            // Walking animation
            const walkSpeed = 5;
            const walkAmplitude = 0.1;
            
            // Animate legs
            const leftLeg = this.modelGroup.children[4];
            const rightLeg = this.modelGroup.children[5];
            
            if (leftLeg && rightLeg) {
                leftLeg.position.z = Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
                rightLeg.position.z = -Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
            }
            
            // Animate arms
            const leftArm = this.modelGroup.children[2];
            const rightArm = this.modelGroup.children[3];
            
            if (leftArm && rightArm) {
                leftArm.rotation.x = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
                rightArm.rotation.x = -Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
            }
        } else {
            // Reset to idle position
            const leftLeg = this.modelGroup.children[4];
            const rightLeg = this.modelGroup.children[5];
            const leftArm = this.modelGroup.children[2];
            const rightArm = this.modelGroup.children[3];
            
            if (leftLeg && rightLeg && leftArm && rightArm) {
                leftLeg.position.z = 0;
                rightLeg.position.z = 0;
                leftArm.rotation.x = 0;
                rightArm.rotation.x = 0;
            }
        }
        
        // Attack animation
        if (playerState.isAttacking()) {
            // Simple attack animation
            const rightArm = this.modelGroup.children[3];
            if (rightArm) {
                rightArm.rotation.x = Math.sin(Date.now() * 0.02) * 0.5;
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
    
    getModelGroup() {
        return this.modelGroup;
    }
}
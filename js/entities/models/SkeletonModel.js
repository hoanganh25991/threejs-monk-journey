import * as THREE from 'three';
import { EnemyModel } from './EnemyModel.js';

export class SkeletonModel extends EnemyModel {
    constructor(enemy, modelGroup) {
        super(enemy, modelGroup);
    }
    
    createModel() {
        // Create body (thin box)
        const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.3);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.enemy.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (skull-like sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: this.enemy.color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.scale.set(1, 1.2, 1);
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create arms (thin cylinders)
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: this.enemy.color });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 0.6, 0);
        leftArm.rotation.z = Math.PI / 4;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 0.6, 0);
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Create legs (thin cylinders)
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: this.enemy.color });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, 0, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, 0, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
        
        // Add weapon for skeleton king
        if (this.enemy.type === 'skeleton_king') {
            // Create crown
            const crownGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
            const crownMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.y = 1.6;
            crown.castShadow = true;
            
            this.modelGroup.add(crown);
            
            // Create sword
            const swordGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
            const swordMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const sword = new THREE.Mesh(swordGeometry, swordMaterial);
            sword.position.set(0.6, 0.6, 0);
            sword.castShadow = true;
            
            this.modelGroup.add(sword);
        }
    }
    
    updateAnimations(delta) {
        // Implement skeleton-specific animations here if needed
    }
}
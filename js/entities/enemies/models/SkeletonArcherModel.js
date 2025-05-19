import * as THREE from 'three';
import { SkeletonModel } from './SkeletonModel.js';

/**
 * Model for Skeleton Archer enemy type
 * Extends the base SkeletonModel with a bow
 */
export class SkeletonArcherModel extends SkeletonModel {
    constructor(enemy, modelGroup) {
        super(enemy, modelGroup);
    }
    
    createModel() {
        // Call the parent class's createModel to create the basic skeleton
        super.createModel();
        
        // Add a bow
        this.createBow();
    }
    
    /**
     * Create a bow for the skeleton archer
     */
    createBow() {
        // Create bow (curved cylinder)
        const bowCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, -0.4, 0),
            new THREE.Vector3(0.2, 0, 0),
            new THREE.Vector3(0.2, 0, 0),
            new THREE.Vector3(0, 0.4, 0)
        );
        
        const bowGeometry = new THREE.TubeGeometry(bowCurve, 20, 0.03, 8, false);
        const bowMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color for bow
        const bow = new THREE.Mesh(bowGeometry, bowMaterial);
        bow.position.set(-0.5, 0.6, 0.1);
        bow.castShadow = true;
        
        this.modelGroup.add(bow);
        
        // Create bowstring (line)
        const stringGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -0.4, 0),
            new THREE.Vector3(-0.05, 0, 0),
            new THREE.Vector3(0, 0.4, 0)
        ]);
        const stringMaterial = new THREE.LineBasicMaterial({ color: 0xCCCCCC });
        const bowstring = new THREE.Line(stringGeometry, stringMaterial);
        bowstring.position.set(-0.5, 0.6, 0.1);
        
        this.modelGroup.add(bowstring);
        
        // Create arrow
        const arrowShaftGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 8);
        const arrowShaftMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const arrowShaft = new THREE.Mesh(arrowShaftGeometry, arrowShaftMaterial);
        arrowShaft.rotation.z = Math.PI / 2;
        arrowShaft.position.set(-0.3, 0.6, 0.1);
        arrowShaft.castShadow = true;
        
        this.modelGroup.add(arrowShaft);
        
        // Create arrowhead
        const arrowheadGeometry = new THREE.ConeGeometry(0.03, 0.1, 8);
        const arrowheadMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const arrowhead = new THREE.Mesh(arrowheadGeometry, arrowheadMaterial);
        arrowhead.rotation.z = Math.PI / 2;
        arrowhead.position.set(-0.05, 0.6, 0.1);
        arrowhead.castShadow = true;
        
        this.modelGroup.add(arrowhead);
    }
    
    updateAnimations(delta) {
        // Implement skeleton archer specific animations
        // For example, drawing the bow
        const time = Date.now() * 0.001; // Convert to seconds
        
        // Make the bow arm move slightly to simulate aiming
        if (this.modelGroup && this.modelGroup.children.length > 3) {
            const leftArm = this.modelGroup.children[2]; // Left arm is the third child
            if (leftArm) {
                leftArm.rotation.z = Math.PI / 4 + Math.sin(time * 0.5) * 0.1;
            }
        }
    }
}
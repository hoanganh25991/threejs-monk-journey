import * as THREE from 'three';

/**
 * Represents a quest marker interactive object
 */
export class QuestMarker {
    /**
     * Create a new quest marker
     * @param {string} questName - Name of the quest
     */
    constructor(questName) {
        this.questName = questName;
    }
    
    /**
     * Create the quest marker mesh
     * @returns {THREE.Group} - The quest marker group
     */
    createMesh() {
        const markerGroup = new THREE.Group();
        
        // Create marker post
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 1;
        post.castShadow = true;
        post.receiveShadow = true;
        
        markerGroup.add(post);
        
        // Create marker sign
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const signGeometry = new THREE.BoxGeometry(1, 0.8, 0.1);
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 1.8, 0);
        sign.castShadow = true;
        sign.receiveShadow = true;
        
        markerGroup.add(sign);
        
        // Create glowing marker
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00
        });
        
        const markerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(0, 2.2, 0);
        
        markerGroup.add(marker);
        
        return markerGroup;
    }
}
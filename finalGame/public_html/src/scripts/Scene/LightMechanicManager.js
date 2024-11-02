import { calcEuclid } from "../util/calcEuclid.js";

export class LightMechanicManager {
    constructor(characterLight, health = 100, damageRate = 20, healingRate = 10) {
        this.characterLight = characterLight;
        this.health = health;
        this.maxHealth = 100;
        this.damageRate = damageRate;
        this.healingRate = healingRate;

        this.lightTimers = {}; // Track time spent near lights
        this.initialHealth = health; // Used for resetting

        // Initialize the health bar display
        this.updateHealthBar();
    }

    /**
     * Update the health bar based on current health and maximum health
     */
    updateHealthBar() {
        const healthPercentage = (this.health / this.maxHealth) * 100; // Calculate percentage
        const healthBar = document.getElementById('user-health-bar');
        healthBar.style.width = `${healthPercentage}%`; // Update the width of the health bar
    }

    /**
     * Update the character's light intensity and distance based on current health
     */
    // updateCharacterLight() {
    //     if (this.characterLight) {
    //         // Calculate light intensity and distance based on health
    //         const maxIntensity = 1;
    //         const maxDistance = 5;
    //         const minIntensity = 0.2;
    //         const minDistance = 1;
    //         const healthPercentage = this.health / 100;
    //         this.characterLight.intensity = minIntensity + (maxIntensity - minIntensity) * healthPercentage;
    //         this.characterLight.distance = minDistance + (maxDistance - minDistance) * healthPercentage;
    //     }
    // }

    updateCharacterLight() {
        if (this.characterLight) {
            // Calculate light intensity and distance based on health
            const maxIntensity = 1.5;      
            const maxDistance = 7;       
            const minIntensity = 0.1;    
            const minDistance = 0.5;     
            
            const healthPercentage = this.health / 100;
            
            // Apply exponential curve to make changes more dramatic
            // Math.pow(healthPercentage, 1.5) creates a curve that drops off more quickly at lower health
            const lightFactor = Math.pow(healthPercentage, 1.5);
            
            // Update light properties
            this.characterLight.intensity = minIntensity + (maxIntensity - minIntensity) * lightFactor;
            this.characterLight.distance = minDistance + (maxDistance - minDistance) * lightFactor;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health); // Ensure health doesn't go below 0
        this.updateHealthBar(); // Update the health bar when health changes
        this.updateCharacterLight(); // Update light when health changes

        if (this.health <= 0) {
            this.health = -1;
        }
    }

    heal(amount) {
        this.health += amount;
        this.health = Math.min(this.maxHealth, this.health); // Cap health at maxHealth
        this.updateHealthBar(); // Update the health bar when health changes
        this.updateCharacterLight(); // Update light when health changes
    }

    /**
     * Handles the functionality of flickering lights
     * @param {THREE.Light} light 
     * @param {int} index 
     */
    flickerLight(light, index, target) {
        let flickerDuration = 2; // Flicker for 2 seconds
        let flickerInterval = 100; // Flicker every 200ms
        let flickerCount = flickerDuration * 1000 / flickerInterval; // Total flickers
        let originalIntensity = light.intensity;

        let flickerEffect = setInterval(() => {
            light.intensity = light.intensity === 0 ? originalIntensity : 0; // Toggle light intensity
            flickerCount--;

            if (flickerCount <= 0) {
                clearInterval(flickerEffect);
                light.intensity = 0; // Turn off the light
                // Reset the timer for this light
                if (this.lightTimers[index]) {
                    this.lightTimers[index].time = 0;
                    this.lightTimers[index].flickering = false;
                }

                // Apply damage if the character is still near the light
                if (calcEuclid(target.position.x, target.position.z, light.position.x, light.position.z)) {
                    this.takeDamage(this.damageRate); // Take the same damage as usual when the light goes off
                }
            }
        }, flickerInterval);
    }

    /**
     * Starts the process of checking if player is close enough to any lights, if so then heal, otherwise damage.
     * @param {*} points 
     * @param {*} target 
     */
    damageTimer(points, target) {
        let valid = false;

        if (target==undefined){
            return;
        }

        points.forEach((light, index) => {
            // Check distance to each light
            if (calcEuclid(target.position.x, target.position.z, light.position.x, light.position.z)) {
                valid = true;

                // Initialize or increment the timer for this light
                if (!this.lightTimers[index]) {
                    this.lightTimers[index] = { time: 0, flickering: false };
                }

                this.lightTimers[index].time += 1; // Increment time spent in light

                // Heal if the light is on
                if (light.intensity > 0) {
                    this.heal(this.healingRate);
                }

                // Check if time exceeds 3 seconds
                if (this.lightTimers[index].time >= 3 && !this.lightTimers[index].flickering) {
                    this.lightTimers[index].flickering = true;
                    this.flickerLight(light, index, target); // Pass index for reset after flickering
                }
            } else {
                // Reset the timer if not in light
                if (this.lightTimers[index]) {
                    this.lightTimers[index].time = 0;
                    this.lightTimers[index].flickering = false;
                }
            }
        });

        if (!valid) {
            this.takeDamage(this.damageRate); // Take damage if not within any light
        }
    }

    /**
     * Resets health to starting value
     */
    resetHealth() {
        this.health = this.initialHealth;
        this.updateHealthBar(); // Reset the health bar
    }

    /**
     * 
     * @returns health value
     */
    getHealth() {
        return this.health;
    }
}

import { audioFiles } from "../../data/audio.js";


export class SoundEffectsManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create an AudioContext
        this.soundBuffers = {}; // Object to store decoded audio buffers by sound name
        this.init();
    }



    async init() {
        let sounds ={}
        audioFiles.forEach((data) => {
            sounds[data.name] = `src/audio/${data.file}`; // Adjust the path as needed
        });

        await this.loadMultipleSounds(sounds);
    }
    


    
    /**
     * Load an audio file and store it for later use
     * @param {string} name - The name to identify this sound effect (e.g., "doorCreak")
     * @param {string} url - The path to the audio file (e.g., "src/audio/door-creak.mp3")
     * @returns {Promise} Resolves when the audio is loaded
     */
    async loadSound(name, url) {
        try {
            const sound = new Audio(url);
            this.soundBuffers[name] = sound;
        } catch (error) {
            console.error(`Error loading sound ${name} from ${url}:`, error);
        }
    }
    
    

    /**
     * Play a loaded sound by name with optional volume
     * @param {string} name - The name of the sound effect to play (e.g., "doorCreak")
     * @param {number} [volume=1.0] - The volume level (between 0.0 and 1.0)
     */
    playSound(name, volume = 1.0) { 
        const soundBuffer = this.soundBuffers[name];
        if (soundBuffer) {
            soundBuffer.volume = volume; // Set the volume level
            soundBuffer.play();
        } else {
            console.warn(`Sound ${name} has not been loaded.`);
        }
    }

    /**
     * Toggle or set looping for a specific sound
     * @param {string} name - The name of the sound effect to toggle looping for
     * @param {boolean} [shouldLoop] - Optional parameter to explicitly set looping to true or false
     */
    toggleLoop(name, shouldLoop = null) {
        const soundBuffer = this.soundBuffers[name];
        if (soundBuffer) {
            if (shouldLoop !== null) {
                soundBuffer.loop = shouldLoop; // Set looping to the specified value
            } else {
                soundBuffer.loop = !soundBuffer.loop; // Toggle looping if no specific value provided
            }
        } else {
            console.warn(`Sound ${name} has not been loaded.`);
        }
    }

    /**
     * Load multiple sounds at once
     * @param {Object} sounds - An object containing sound names and their file paths
     *                          e.g., { doorCreak: 'src/audio/door-creak.mp3', background: 'src/audio/bg.mp3' }
     * @returns {Promise} Resolves when all sounds are loaded
     */
    loadMultipleSounds(sounds) {
        const loadPromises = Object.entries(sounds).map(([name, url]) => this.loadSound(name, url));
        return Promise.all(loadPromises);
    }
}

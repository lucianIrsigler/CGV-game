// Crosshair.js
export class Crosshair {
    constructor(size = 10, color = 'red') {
        this.size = size;
        this.color = color;
        this.crosshairElement = null; // Store the reference to the crosshair element
        this.createCrosshair();
    }

    createCrosshair() {
        // Create Crosshair element
        this.crosshairElement = document.createElement('div');
        this.crosshairElement.style.width = `${this.size}px`; // Width of the crosshair
        this.crosshairElement.style.height = `${this.size}px`; // Height of the crosshair
        this.crosshairElement.style.backgroundColor = this.color; // Color of the crosshair
        this.crosshairElement.style.borderRadius = '50%'; // Make it round
        this.crosshairElement.style.position = 'absolute';
        this.crosshairElement.style.top = '50%'; // Center vertically
        this.crosshairElement.style.left = '50%'; // Center horizontally
        this.crosshairElement.style.transform = 'translate(-50%, -50%)'; // Adjust position to center
        this.crosshairElement.style.pointerEvents = 'none'; // Make sure it doesn't block mouse events

        // Append crosshair to the document body
        document.body.appendChild(this.crosshairElement);
    }

    // Optionally, you can add more methods to customize or update the crosshair
    setColor(newColor) {
        this.crosshairElement.style.backgroundColor = newColor;
    }

    setSize(newSize) {
        this.crosshairElement.style.width = `${newSize}px`;
        this.crosshairElement.style.height = `${newSize}px`;
    }

    removeCrosshair() {
        if (this.crosshairElement) {
            document.body.removeChild(this.crosshairElement);
        }
    }

    hideCrosshair() {
        this.crosshairElement.style.display = 'none';
    }

    showCrosshair() {
        this.crosshairElement.style.display = 'block';
    }
}

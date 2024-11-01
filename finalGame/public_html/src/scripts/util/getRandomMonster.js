export function getRandomMonster(monsters) {
    const keys = Object.keys(monsters); // Get the keys of the monster object
    const randomIndex = Math.floor(Math.random() * keys.length); // Generate a random index
    const randomKey = keys[randomIndex]; // Select a random key
    return monsters[randomKey]; // Return the key and the monster details
}
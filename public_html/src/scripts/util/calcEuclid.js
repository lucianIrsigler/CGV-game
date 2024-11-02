
/**
 * Does Euclidean distance
 * @param {int} x1 
 * @param {int} z1 
 * @param {int} x2 
 * @param {int} z2 
 * @returns 
 */
export function calcEuclid(x1, z1, x2, z2) {
    const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
    return distance <= 2;
}
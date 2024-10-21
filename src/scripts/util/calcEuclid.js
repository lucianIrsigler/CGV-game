export function calcEuclid(x1, z1, x2, z2) {
    const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
    return distance <= 2;
}

import fs from 'fs';
import path from 'path';

export async function loadModules(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);

        if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
            // Dynamically import the module
            const module = await import(filePath);
            // You can do something with the imported module here
            console.log(`Loaded module: ${file}`, module);
        }
    }
}

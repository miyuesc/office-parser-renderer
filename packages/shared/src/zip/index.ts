import * as fflate from 'fflate';

export class ZipService {
    static async load(buffer: ArrayBuffer): Promise<Record<string, Uint8Array>> {
        return new Promise((resolve, reject) => {
            const data = new Uint8Array(buffer);
            fflate.unzip(data, (err, unzipped) => {
                if (err) return reject(err);
                resolve(unzipped);
            });
        });
    }

    static async loadText(buffer: ArrayBuffer): Promise<Record<string, string>> {
        const files = await this.load(buffer);
        const textFiles: Record<string, string> = {};
        const decoder = new TextDecoder();
        
        for (const [path, content] of Object.entries(files)) {
            // Only decode XML or RELS files to text to save time
            if (path.endsWith('.xml') || path.endsWith('.rels')) {
                textFiles[path] = decoder.decode(content);
            }
        }
        return textFiles;
    }
}

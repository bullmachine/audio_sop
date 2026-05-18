#!/usr/bin/env node

require('dotenv').config();

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

console.log('Environment Variables:');
console.log('- PORT:', process.env.PORT);
console.log('- HOST:', process.env.HOST);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('');
console.log(`Triggering cron on http://${host}:${port}/api/system-cron/manual-trigger`);
console.log(`Triggering Resource Group sync on http://${host}:${port}/api/system-cron/manual-trigger-resource-groups`);
console.log(`Triggering Parts sync on http://${host}:${port}/api/system-cron/manual-trigger-parts`);

const http = require('http');

// Health check function with port fallback
function checkHealth(portToTry) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: host,
            port: portToTry,
            path: '/api/system-cron/health',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ port: portToTry, data: data });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Sync function for Process
function triggerProcessSync(workingPort) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({});
        
        const options = {
            hostname: host,
            port: workingPort,
            path: '/api/system-cron/manual-trigger',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ type: 'Process', data }));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Sync function for ResourceGroup
function triggerResourceGroupSync(workingPort) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({});
        
        const options = {
            hostname: host,
            port: workingPort,
            path: '/api/system-cron/manual-trigger-resource-groups',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ type: 'ResourceGroup', data }));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Sync function for Parts
function triggerPartsSync(workingPort) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({});
        
        const options = {
            hostname: host,
            port: workingPort,
            path: '/api/system-cron/manual-trigger-parts',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 180000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ type: 'Parts', data }));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Main execution with port fallback
async function main() {
    try {
        console.log('Checking if server is accessible on port', port);
        
        let healthResult;
        try {
            healthResult = await checkHealth(port);
        } catch (error) {
            console.log(`Health check failed on port ${port}, trying default port 5000...`);
            healthResult = await checkHealth(5000);
        }
        
        console.log('Health check response:', healthResult.data);
        console.log('Using working port:', healthResult.port);
        
        if (healthResult.data.includes('healthy')) {
            console.log('Server is healthy, proceeding with simultaneous sync...');
            
            // Call both sync endpoints simultaneously
            const [processResult, resourceGroupResult, partsResult] = await Promise.all([
                triggerProcessSync(healthResult.port),
                triggerResourceGroupSync(healthResult.port),
                triggerPartsSync(healthResult.port)
            ]);
            
            console.log('=== Sync Results ===');
            console.log(`${processResult.type} Sync Response:`, processResult.data);
            console.log(`${resourceGroupResult.type} Sync Response:`, resourceGroupResult.data);
            console.log(`${partsResult.type} Sync Response:`, partsResult.data);
            console.log('=== All sync operations completed ===');
        } else {
            console.error('Server health check failed. Server may not be running.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();

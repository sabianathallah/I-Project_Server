// Test script untuk Google Login endpoint
require('dotenv').config();
const app = require('./app');
const http = require('http');

const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📍 Testing endpoint: POST /google-login\n`);
    
    console.log('� Configuration Check:');
    console.log(`   Google Client ID: ${process.env.GOOGLE_CLIENT_ID ? '✓ Configured' : '✗ Missing'}`);
    
    // Test dengan invalid token (untuk cek apakah routing bekerja)
    console.log('\n🧪 Testing with invalid token (to check if routing works)...\n');
    
    const postData = JSON.stringify({
        googleToken: 'invalid-test-token'
    });
    
    const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/google-login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    setTimeout(() => {
        const req = http.request(options, (res) => {
            console.log(`📡 Response Status: ${res.statusCode}`);
            console.log(`📡 Response Headers:`, res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📦 Response Body:`, data);
                
                if (res.statusCode === 404) {
                    console.log('\n❌ FAILED: Route not found (404)');
                    console.log('   Check your router configuration in routes/index.js');
                } else {
                    console.log('\n✅ SUCCESS: Route is working!');
                    console.log('   Expected behavior: Should fail with invalid token');
                    console.log('   This confirms the routing is correctly configured');
                }
                
                console.log('\n✓ Test completed. Stopping server...');
                server.close();
                process.exit(0);
            });
        });
        
        req.on('error', (e) => {
            console.error(`❌ Request Error: ${e.message}`);
            server.close();
            process.exit(1);
        });
        
        req.write(postData);
        req.end();
    }, 500);
});

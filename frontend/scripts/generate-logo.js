#!/usr/bin/env node

// Simple PNG logo generator using sharp
const fs = require('fs');
const path = require('path');

// We'll create a simple base64 PNG and save it
// This is a 100x100 purple gradient square with rounded corners

const generateLogo = async () => {
  try {
    const sharp = require('sharp');
    const outputPath = path.join(__dirname, '../src/assets/icons/logo.png');
    
    // Create a gradient background and add text
    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 102, g: 126, b: 234, alpha: 1 }
      }
    })
    .composite([
      {
        input: {
          create: {
            width: 100,
            height: 100,
            channels: 4,
            background: { r: 118, g: 75, b: 162, alpha: 0.5 }
          }
        },
        gravity: 'center'
      }
    ])
    .png()
    .toFile(outputPath);
    
    console.log('Logo created successfully at:', outputPath);
  } catch (error) {
    console.error('Sharp not available, creating base64 PNG instead...');
    // Fallback: create a simple base64 PNG
    createBase64Logo();
  }
};

const createBase64Logo = () => {
  // This is a simple 1x1 purple pixel PNG encoded in base64
  // For production, replace with a proper logo
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64PNG, 'base64');
  
  const outputPath = path.join(__dirname, '../src/assets/icons/logo.png');
  fs.writeFileSync(outputPath, buffer);
  console.log('Base64 Logo created at:', outputPath);
};

generateLogo();

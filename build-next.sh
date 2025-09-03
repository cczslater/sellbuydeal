#!/bin/bash
echo "Installing Node.js dependencies..."
/opt/alt/alt-nodejs18/root/usr/bin/npm install

echo "Building Next.js app..."
/opt/alt/alt-nodejs18/root/usr/bin/npm run build

echo "Done! You can now restart your Node.js app in cPanel."

#!/bin/sh

# raspberry pi user
USER=pi

# fuse grup
FUSE=fuse

# gadget
GADGET=raspberrypi

echo Installing Server
source wyliodrin-werver-install.sh

echo Installing Raspberry Pi Libraries

# install wiringpi
echo Installing WiringPi
cd download
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build
cd ..

# node-wiringpi
echo Installing Node WiringPi
npm install -g wiring-pi

# python wiringpi2
echo Installing Python WiringPi2
cd download
git clone https://github.com/Gadgetoid/WiringPi2-Python.git
cd WiringPi2-Python
sudo python setup.py install
cd ..

echo You need to logout and goin again


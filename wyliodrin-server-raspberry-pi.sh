#!/bin/bash

# raspberry pi user
USER=pi

# fuse grup
FUSE=fuse

# gadget
GADGET=raspberrypi

mkdir download

echo Installing Server
source wyliodrin-server-install.sh

echo Installing Raspberry Pi Libraries

# install wiringpi
echo Installing WiringPi
cd download
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build
cd ..

# bass.dll
sudo cp libs/raspberrypi/c/bass/linbass* /usr/local/lib
sudo ldconfig

# perl wiringpi
echo Installing Perl WiringPi
cd download
git clone --recursive https://github.com/Wyliodrin/WiringPi-Perl.git
cd WiringPi-Perl
./build.sh
cp wiringpi.pm ../../libs/raspberrypi/perl
cp wiringpi.so ../../libs/raspberrypi/perl
cd ../..

# php wiringpi
echo Installing PHP WiringPi
cd download
git clone --recursive https://github.com/Wyliodrin/WiringPi-PHP.git
cd WiringPi-PHP
./build.sh
sudo ./install.sh
echo "extension=wiringpi.so
pinmapmode=PROGRAM" > wiringpi.ini
sudo cp wiringpi.ini /etc/php5/conf.d/
cd ../..



# node-wiringpi
echo Installing Node WiringPi
sudo npm install -g wiring-pi

# python wiringpi2
echo Installing Python WiringPi2
cd download
git clone https://github.com/Gadgetoid/WiringPi2-Python.git
cd WiringPi2-Python
sudo python setup.py install
cd ../..

# installing upstart
echo Wyliodrin uses upstart for starting the service
echo This will replace system init
echo Please be sure that you know what you are doing
echo If you do not install upstart, Wyliodrin will not start
echo automatically
if sudo apt-get install upstart
then

echo "
# wyliodrin server

description \"wyliodrin server\"
author \"Ioana Culic\"

start on runlevel [2345]
stop on runlevel [016]
chdir `pwd`
script
        export NODE_PATH=\"/usr/local/lib/node_modules\"
        sudo -E -u $USER /usr/local/bin/npm start
end script
respawn
" > wyliodrin-server.conf

sudo cp wyliodrin-server.conf /etc/init/wyliodrin.conf

fi

echo You need to restart your Raspberry Pi

sudo rm -rf download



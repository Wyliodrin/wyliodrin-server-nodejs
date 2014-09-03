#!/bin/bash

# redis
#install redis
sudo apt-get install redis-server
sudo apt-get install libhiredis-dev

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
git clone https://github.com/Wyliodrin/wiringPi.git
cd wiringPi
./build
cd ..

# install libwyliodrin
echo Installing libwyliodrin
cd download
git clone https://github.com/Wyliodrin/libwyliodrin.git
cd libwyliodrin
mkdir build
cd build
cmake -DRASPBERRYPI=ON ..
make
sudo make install
cd ..
cd ..
sudo install_social

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



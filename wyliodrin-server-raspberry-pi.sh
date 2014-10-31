#!/bin/bash

# redis
#install redis
sudo apt-get -y install redis-server libhiredis-dev

#install tools
sudo apt-get -y install -y mc vim

# mpg123
sudo apt-get install -y mpg123

# raspberry pi user
USER=pi

# fuse grup
FUSE=fuse

# gadget
GADGET=raspberrypi

echo Installing Server
# install nodejs
wget https://gist.github.com/raw/3245130/v0.10.24/node-v0.10.24-linux-arm-armv6j-vfp-hard.tar.gz
cd /usr/local
sudo tar xzvf /home/pi/node-v0.10.24-linux-arm-armv6j-vfp-hard.tar.gz --strip=1
sudo ln -s /usr/local/lib/node_modules /usr/local/lib/node
cd

sudo apt-get -y install libfuse-dev redis-server libicu-dev

git clone https://github.com/Wyliodrin/wyliodrin-server-nodejs
cd wyliodrin-server-nodejs
git checkout development
npm install
chmod a+x patch.sh
./patch.sh
cd

echo Installing Raspberry Pi Libraries

# install wiringpi
echo Installing WiringPi
git clone https://github.com/wyliodrin/wiringPi.git
cd wiringPi
./build
cd

sudo apt-get -y install libi2c-dev

sudo apt-get -y install cmake libhiredis-dev libjansson-dev python-dev

wget http://prdownloads.sourceforge.net/swig/swig-3.0.2.tar.gz
tar xvfz swig-3.0.2.tar.gz
wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.35.tar.gz
tar xvfz pcre-8.35.tar.gz

cd pcre-8.35
./configure
make
sudo make install
cd

sudo ldconfig

cd swig-3.0.2
./configure
make
sudo make install
cd

sudo apt-get install -y gcc-4.7 g++-4.7
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.6 60 --slave /usr/bin/g++ g++ /usr/bin/g++-4.6
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.7 40 --slave /usr/bin/g++ g++ /usr/bin/g++-4.7
sudo update-alternatives --config gcc 

# install libwyliodrin
echo Installing libwyliodrin
git clone https://github.com/wyliodrin/libwyliodrin
cd libwyliodrin
mkdir build
cd build
cmake -DRASPBERRYPI=ON .. 
make
sudo make install
cd

git clone https://github.com/DexterInd/BrickPi_Python.git
sudo apt-get -y install python-setuptools
cd BrickPi_Python
sudo python setup.py install
cd

sudo mkdir /wyliodrin
sudo chown pi /wyliodrin
cp .bashrc /wyliodrin/

sudo usermod -a -G fuse pi

sudo apt-get -y install python python-dev python-setuptools python-pip

git clone https://github.com/DexterInd/BrickPi_Python.git
cd BrickPi_Python
sudo python setup.py install
cd

export wyliodrin_board=raspberrypi
sudo -E install_social

sudo apt-get -y install arduino minicom picocom
sudo pip install ino 
sudo npm install -g serialport

sudo adduser pi i2c
sudo apt-get -y install i2c-tools

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
chdir `pwd`/wyliodrin-server-nodejs
script
        export NODE_PATH=\"/usr/local/lib/node_modules\"
        sudo -E -u $USER /usr/local/bin/npm start
end script
respawn
" > wyliodrin-server.conf

sudo cp wyliodrin-server.conf /etc/init/wyliodrin.conf

fi

#/etc/inittab
echo please comment this line "T0:23:respawn:/sbin/getty -L ttyAMA0 115200 vt100" in /etc/inittab
echo please enable i2c following the tutorial https://www.abelectronics.co.uk/i2c-raspbian-wheezy/info.aspx

echo You need to restart your Raspberry Pi






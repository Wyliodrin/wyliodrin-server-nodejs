#!/bin/sh

# nodejs version to install
NODE_VERSION=v0.10.23

# update packages list
sudo apt-get update

# install build tools
sudo apt-get -y install gcc g++ automake make libicu-dev libfuse-dev

# install vim
sudo apt-get -y install vim

# install mc
sudo apt-get -y install mc 

# install git
sudo apt-get -y install git 

# install nodejs
cd download
wget http://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION.tar.gz
tar xvfz node-$NODE_VERSION.tar.gz
if cd node-$NODE_VERSION
then
	./configure
	make
	sudo make install
	cd ..
else
	echo failed to install nodejs
fi
cd ..

# install wyliodrin-server-nodejs
npm install
sudo adduser $USER $FUSE
sudo mkdir /wyliodrin
sudo chown $USER:$USER /wyliodrin
cp libs/$GADGET/bash/.bashrc /wyliodrin
mkdir /wyliodrin/projects
mkdir /wyliodrin/projects/mount
mkdir /wyliodrin/projects/projects_build
sudo ln -s `pwd`/libs /usr/local/lib/wyliodrin

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


# install python, python-dev, pyserial,  pybass, mplayer.py
sudo apt-get -y install python python-dev python-setuptools

# python wiringpi2
echo Installing Python WiringPi2
cd download
git clone https://github.com/Gadgetoid/WiringPi2-Python.git
cd WiringPi2-Python
sudo python setup.py install
cd ../..

cd download
if git clone https://github.com/baudm/mplayer.py.git
then
	cd mplayer.py
	sudo python setup.py install
	cd ..
fi
cd ..

cd download
if git clone https://github.com/Wyliodrin/pybass.git
then
	cd pybass
	sudo python setup.py install
	cd ..
fi
cd ..

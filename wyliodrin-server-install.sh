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

# install mplayer
sudo apt-get -y install mplayer

# install java
sudo apt-get -y install oracle-java7-jdk

# install free pascal
sudo apt-get -y install fpc

# install mono
sudo apt-get -y install mono-devel

# install objective-c
sudo apt-get install -y gnustep-core-devel

# install python, python-dev, pyserial,  mplayer.py
sudo apt-get -y install python python-dev python-setuptools

cd download
if git clone https://github.com/baudm/mplayer.py.git
then
	cd mplayer.py
	sudo python setup.py install
fi
cd ..

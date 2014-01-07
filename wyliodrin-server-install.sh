#!/bin/sh

# nodejs version to install
NODE_VERSION=v0.10.23

mkdir download

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
else
	echo failed to install nodejs
fi
cd ..

# install wyliodrin-server-nodejs
npm install
sudo adduser $USER $FUSE
sudo mkdir /wyliodrin
sudo chown $USER:$USER /wyliodrin
mkdir /wyliodrin/projects
mkdir /wyliodrin/projects/mount
mkdir /wyliodrin/projects/projects_build
sudo ln -s `pwd`/libs/$GADGET /usr/local/lib/wyliodrin

# install java
sudo apt-get -y install oracle-java7-jdk

# install free pascal
sudo apt-get -y install fpc

# install mono
sudo apt-get -y install mono-devel

# install python, python-dev, pyserial
sudo apt-get -y install python python-dev python-setuptools




#!/bin/bash

#install gcc
sudo apt-get -y install gcc g++ automake make
sudo apt-get install ntpd

#install node
wget http://nodejs.org/dist/v0.10.28/node-v0.10.28.tar.gz
tar xvfz node-v0.10.28.tar.gz
cd node-v0.10.28
./configure --without-snapshot
make
sudo make install
cd ..

sudo apt-get install vim mc subversion ldconfig redis-server
sudo apt-get install libfuse-dev libicu-dev libhiredis-dev
sudo apt-get install pkg-config
npm install
./patch

sudo apt-get install libevent-dev libjansson-dev python-dev python-pip

#install swig
wget http://prdownloads.sourceforge.net/swig/swig-3.0.2.tar.gz
tar -xvfz swig-3.0.2.tar.gz
wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.35.tar.gz
tar -xvfz pcre-8.35.tar.gz
cd pcre-8.35
./configure
make sudo make install
cd ../swig-3.0.2
./configure
make
sudo make install
cd ..
sudo ln -s /usr/local/bin/swig-3.0.2 /usr/bin/swig-3.0.2

sudo mkdir /wyliodrin 
sudo groupadd fuse
#make debian /wyliodrin owner. it might need to be changed with root
sudo chown -R debian /wyliodrin
sudo usermod -a -G fuse debian

sudo apt-get install cmake

git clone https://github.com/Wyliodrin/libwyliodrin.git
cd libwyliodrin
git checkout beaglebone
mkdir build
cd build
cmake -DBEAGLEBONE=ON ..
ln -s /usr/include/nodejs/src /usr/include/node
mv -r /usr/include/nodejs/deps/uv/include/* /usr/include/node
make
sudo make install
cd ../..

sudo apt-get install python-redis arduino ino firmata

echo "
[Unit]
Description=Wyliodrin server
#After=redis.service
ConditionFileNotEmpty=/boot/uboot/wyliodrin.json

[Service]
Type=simple
ExecStart=/usr/bin/node /home/debian/wyliodrin-server-nodejs/start_script.js
#ExecStart=/usr/bin/node /usr/lib/node/wyliodrin-server-nodejs/start_script.js
Restart=always
ExecStop=/bin/kill -15 $MAINPID
WorkingDirectory=/home/debian/wyliodrin-server-nodejs
#WorkingDirectory=/usr/lib/node/wyliodrin-server-nodejs
PIDFile=/var/run/wyliodrin-server.pid

[Install]
WantedBy=multi-user.target
" > wyliodrin.service

sudo cp wyliodrin.service /etc/systemd/system/wyliodrin.service
ln -s /etc/systemd/system/wyliodrin.service /etc/systemd/system/multi-user.target.wants


#!/bin/bash

connmanctl disable wifi
connmanctl enable wifi
sleep 1
connmanctl scan wifi
WIFIHASH=`connmanctl services | grep "$1" | awk '{print $NF}'`
if test -n $WIFIHASH; then
  mkdir -p /var/lib/connman/$WIFIHASH
  WIFICONFIG=/var/lib/connman/$WIFIHASH/settings
  echo "[$WIFIHASH]" > $WIFICONFIG
  echo "  Name=$1" >> $WIFICONFIG
  echo "  SSID=`echo $WIFIHASH | cut -d \"_\" -f 3`" >> $WIFICONFIG
  echo "  Favorite=True" >> $WIFICONFIG
  echo "  Passphrase=$2" >> $WIFICONFIG
  echo "  IPv4.method=dhcp" >> $WIFICONFIG
  echo "  IPv6.method=auto" >> $WIFICONFIG
  echo "  IPv6.privacy=disabled" >> $WIFICONFIG
  connmanctl disable wifi
  connmanctl enable wifi
  sleep 1
  connmanctl scan wifi
  connmanctl connect $WIFIHASH
fi

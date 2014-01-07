
unit wiringpi;

(* Pascal wrapper unit for Gordon Henderson wiringPi library. The source can
 * be found at https://projects.drogon.net/raspberry-pi/wiringpi/. Wrapper and
 * pascal sample by Alex Schaller.
 *
 * wiringPi:
 *	Arduino compatable (ish) Wiring library for the Raspberry Pi
 *	Copyright (c) 2012 Gordon Henderson
 ***********************************************************************
 * This file is part of wiringPi:
 *	https://projects.drogon.net/raspberry-pi/wiringpi/
 *
 *    wiringPi is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    wiringPi is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with wiringPi.  If not, see <http://www.gnu.org/licenses/>.
 ***********************************************************************
 *)

// Handy defines

{$link /usr/local/lib/libwiringPi.so}
{$linklib c}

interface

  const
    NUM_PINS = 17;    
    WPI_MODE_PINS = 0;    
    WPI_MODE_GPIO = 1;    
    INPUT = 0;    
    OUTPUT = 1;    
    PWM_OUTPUT = 2;    
    LOW = 0;    
    HIGH = 1;    
    PUD_OFF = 0;    
    PUD_DOWN = 1;    
    PUD_UP = 2;

    // Pin mappings from P1 connector to WiringPi library
    // Px represents to physical pin on the RaspberryPi P1 connector
    P3  = 8;
    P5  = 9;
    P7  = 7;
    P8  = 15;
    P10 = 16;
    P11 = 0;
    P12 = 1;
    P13 = 2;
    P15 = 3;
    P16 = 4;
    P18 = 5;
    P19 = 12;
    P21 = 13;
    P22 = 6;
    P23 = 14;
    P24 = 10;
    P26 = 11;

Function wiringPiSetup:longint;cdecl;external;

Procedure wiringPiGpioMode(mode:longint);cdecl;external;

Procedure pullUpDnControl(pin:longint; pud:longint);cdecl;external;

Procedure pinMode(pin:longint; mode:longint);cdecl;external;

Procedure digitalWrite(pin:longint; value:longint);cdecl;external;

Procedure pwmWrite(pin:longint; value:longint);cdecl;external;

Function digitalRead(pin:longint):longint;cdecl;external;

Procedure delay(howLong:dword);cdecl;external;

Procedure delayMicroseconds(howLong:dword);cdecl;external;

Function millis:dword;cdecl;external;


implementation


end.


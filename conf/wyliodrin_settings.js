"use strict";

var settings =
{
	raspberrypi:{
		config_file: '/boot/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'sudo umount -f',
		run: ['sudo', '-E', 'make'],
		board:"raspberrypi"
	},
	
	arduinogalileo:{
		config_file: '/media/card/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'umount -f',
		run: ['make'],
		board:"arduinogalileo"
	},

	fpga:{	
		config_file: '/boot/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'sudo umount -f',
		run: ['make'],
		board:"fpga"
	}
};

module.exports = settings;

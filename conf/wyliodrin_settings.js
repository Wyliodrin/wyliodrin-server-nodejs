"use strict";

var settings =
{
	raspberry:{
		config_file: '/boot/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'sudo umount -f',
		run: ['sudo', '-E', 'make']
	},
	
	arduinogalileo:{
		config_file: '/media/card/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'umount -f',
		run: ['make']
	},

	fpga:{	
		config_file: '/boot/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'sudo umount -f',
		run: ['make']
	}
};

module.exports = settings;

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
		stop: ['sudo kill -9'],
		sudo: 'sudo',
		board:"raspberrypi"
	},
	
	edison:{
		config_file: '/media/storage/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'umount -f',
		run: ['make'],
		stop: ['kill -9'],
		sudo:'',
		board:"arduinogalileo"
	},
	
	arduinogalileo:{
		config_file: '/media/card/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'umount -f',
		run: ['make'],
		stop: ['kill -9'],
		sudo:'',
		board:"arduinogalileo"
	},

	fpga:{	
		config_file: '/boot/wyliodrin.json',
		home: '/wyliodrin',
		mountFile: '/wyliodrin/projects/mount',
		buildFile: '/wyliodrin/projects/build',
		umount: 'sudo umount -f',
		run: ['make'],
		stop: ['kill -9'],
		sudo:'sudo',
		board:"fpga"
	}
};

module.exports = settings;

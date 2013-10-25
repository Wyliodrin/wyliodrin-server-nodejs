var f4js = require('fuse4js');

var files_xmpp =null;

var ERROR = -2;

var mountFile = null;

function load(modules)
{
	files_xmpp = modules.files_xmpp;
}

function loadConfig(configs)
{
  mountFile = configs.mountFile;
}


/*
 * Handler for the getattr() system call.
 * path: the path to the file
 * cb: a callback of the form cb(err, stat), where err is the Posix return code
 *     and stat is the result in the form of a stat structure (when err === 0)
 */
function getattr(path, cb) 
{    
  console.log('files.js get attr = '+path);
   var stat = {};

   files_xmpp.getAttr(path,function(err, attrs){
   	console.log ('files.js responding get attr');
   	if(err == 0)
   	{
   		stat.size = attrs.size;
   		stat.mode = attrs.mode;
   	} 
   	else
   		err = ERROR; 		
   		cb(err, stat);
   });
};

//---------------------------------------------------------------------------

/*
 * Handler for the readdir() system call.
 * path: the path to the file
 * cb: a callback of the form cb(err, names), where err is the Posix return code
 *     and names is the result in the form of an array of file names (when err === 0).
 */
function readdir(path, cb) 
{
	console.log ('file.js read dir path = '+path);
  files_xmpp.readDir(path,function(err, names){
  	console.log ('file.js responding read dir');
  	if(err != 0)
  		err = ERROR;
  		console.log ('names: '+names);
  		cb(err, names);
  });
}

//---------------------------------------------------------------------------

/*
 * Handler for the open() system call.
 * path: the path to the file
 * flags: requested access flags as documented in open(2)
 * cb: a callback of the form cb(err, [fh]), where err is the Posix return code
 *     and fh is an optional numerical file handle, which is passed to subsequent
 *     read(), write(), and release() calls.
 */
function open(path, flags, cb) {
  
  // files_xmpp.open(path, function(err){
  //   cb(err);
  // });
  cb(0); // we don't return a file handle, so fuse4js will initialize it to 0
}

//---------------------------------------------------------------------------

/*
 * Handler for the read() system call.
 * path: the path to the file
 * offset: the file offset to read from
 * len: the number of bytes to read
 * buf: the Buffer to write the data to
 * fh:  the optional file handle originally returned by open(), or 0 if it wasn't
 * cb: a callback of the form cb(err), where err is the Posix return code.
 *     A positive value represents the number of bytes actually read.
 */

function read(path, offset, len, buf, fh, cb) {
  files_xmpp.read(path,offset,len, function(err,data,length){
    if(err == 0)
    {
      console.log('err = 0');
      err = length;
      buf.write(data, 0, length, 'ascii');
    }
    else
    {
      console.log('else error');
      err = ERROR;
    }
    cb(err);
  });
}

// //---------------------------------------------------------------------------

// /*
//  * Handler for the write() system call.
//  * path: the path to the file
//  * offset: the file offset to write to
//  * len: the number of bytes to write
//  * buf: the Buffer to read data from
//  * fh:  the optional file handle originally returned by open(), or 0 if it wasn't
//  * cb: a callback of the form cb(err), where err is the Posix return code.
//  *     A positive value represents the number of bytes actually written.
//  */
// function write(path, offset, len, buf, fh, cb) {
//   var err = 0; // assume success
//   var info = lookup(obj, path);
//   var file = info.node;
//   var name = info.name;
//   var parent = info.parent;
//   var beginning, blank = '', data, ending='', numBlankChars;
  
//   switch (typeof file) {
//   case 'undefined':
//     err = -2; // -ENOENT
//     break;

//   case 'object': // directory
//     err = -1; // -EPERM
//     break;
      
//   case 'string': // a string treated as ASCII characters
//     data = buf.toString('ascii'); // read the new data
//     if (offset < file.length) {
//       beginning = file.substring(0, offset);
//       if (offset + data.length < file.length) {
//         ending = file.substring(offset + data.length, file.length)
//       }
//     } else {
//       beginning = file;
//       numBlankChars = offset - file.length;
//       while (numBlankChars--) blank += ' ';
//     }
//     delete parent[name];
//     parent[name] = beginning + blank + data + ending;
//     err = data.length;
//     break;
  
//   default:
//     break;
//   }
//   cb(err);
// }

// //---------------------------------------------------------------------------

// /*
//  * Handler for the release() system call.
//  * path: the path to the file
//  * fh:  the optional file handle originally returned by open(), or 0 if it wasn't
//  * cb: a callback of the form cb(err), where err is the Posix return code.
//  */
// function release(path, fh, cb) {
//   cb(0);
// }

// //---------------------------------------------------------------------------

// /*
//  * Handler for the create() system call.
//  * path: the path of the new file
//  * mode: the desired permissions of the new file
//  * cb: a callback of the form cb(err, [fh]), where err is the Posix return code
//  *     and fh is an optional numerical file handle, which is passed to subsequent
//  *     read(), write(), and release() calls (it's set to 0 if fh is unspecified)
//  */
// function create (path, mode, cb) {
//   var err = 0; // assume success
//   var info = lookup(obj, path);
  
//   switch (typeof info.node) {
//   case 'undefined':
//     if (info.parent !== null) {
//       info.parent[info.name] = '';
//     } else {
//       err = -2; // -ENOENT      
//     }
//     break;

//   case 'string': // existing file
//   case 'object': // existing directory
//     err = -17; // -EEXIST
//     break;
      
//   default:
//     break;
//   }
//   cb(err);
// }

// //---------------------------------------------------------------------------

// /*
//  * Handler for the unlink() system call.
//  * path: the path to the file
//  * cb: a callback of the form cb(err), where err is the Posix return code.
//  */
// function unlink(path, cb) {
//   var err = 0; // assume success
//   var info = lookup(obj, path);
  
//   switch (typeof info.node) {
//   case 'undefined':
//     err = -2; // -ENOENT      
//     break;

//   case 'object': // existing directory
//     err = -1; // -EPERM
//     break;

//   case 'string': // existing file
//     delete info.parent[info.name];
//     break;
    
//   default:
//     break;
//   }
//   cb(err);
// }

// //---------------------------------------------------------------------------

// /*
//  * Handler for the rename() system call.
//  * src: the path of the file or directory to rename
//  * dst: the new path
//  * cb: a callback of the form cb(err), where err is the Posix return code.
//  */
// function rename(src, dst, cb) {
//   var err = -2; // -ENOENT assume failure
//   var source = lookup(obj, src), dest;
  
//   if (typeof source.node !== 'undefined') { // existing file or directory
//     dest = lookup(obj, dst);
//     if (typeof dest.node === 'undefined' && dest.parent !== null) {
//       dest.parent[dest.name] = source.node;
//       delete source.parent[source.name];
//       err = 0;
//     } else {
//       err = -17; // -EEXIST
//     }
//   }   
//   cb(err);
// }

// //---------------------------------------------------------------------------

// /*
//  * Handler for the mkdir() system call.
//  * path: the path of the new directory
//  * mode: the desired permissions of the new directory
//  * cb: a callback of the form cb(err), where err is the Posix return code.
//  */
// function mkdir(path, mode, cb) {
//   var err = -2; // -ENOENT assume failure
//   var dst = lookup(obj, path), dest;
//   if (typeof dst.node === 'undefined' && dst.parent != null) {
//     dst.parent[dst.name] = {};
//     err = 0;
//   }
//   cb(err);
// }

// //---------------------------------------------------------------------------

// /*
//  * Handler for the rmdir() system call.
//  * path: the path of the directory to remove
//  * cb: a callback of the form cb(err), where err is the Posix return code.
//  */
// function rmdir(path, cb) {
//   var err = -2; // -ENOENT assume failure
//   var dst = lookup(obj, path), dest;
//   if (typeof dst.node === 'object' && dst.parent != null) {
//     delete dst.parent[dst.name];
//     err = 0;
//   }
//   cb(err);
// }

// //---------------------------------------------------------------------------

/*
 * Handler for the init() FUSE hook. You can initialize your file system here.
 * cb: a callback to call when you're done initializing. It takes no arguments.
 */
function init(cb) {
  cb();
}

// //---------------------------------------------------------------------------

/*
 * Handler for the setxattr() FUSE hook. 
 * The arguments differ between different operating systems.
 * Darwin(Mac OSX):
 *  * a = position
 *  * b = options
 *  * c = cmd
 * Other:
 *  * a = flags
 *  * b = cmd
 *  * c = undefined
 */
function setxattr(path, name, value, size, a, b, c) {
  cb(0);
}

// //---------------------------------------------------------------------------

// /*
//  * Handler for the statfs() FUSE hook. 
//  * cb: a callback of the form cb(err, stat), where err is the Posix return code
//  *     and stat is the result in the form of a statvfs structure (when err === 0)
//  */
function statfs(cb) {
  cb(0, {
      bsize: 1000000,
      frsize: 1000000,
      blocks: 1000000,
      bfree: 1000000,
      bavail: 1000000,
      files: 1000000,
      ffree: 1000000,
      favail: 1000000,
      fsid: 1000000,
      flag: 1000000,
      namemax: 1000000
  });
}

//---------------------------------------------------------------------------

/*
 * Handler for the destroy() FUSE hook. You can perform clean up tasks here.
 * cb: a callback to call when you're done. It takes no arguments.
 */
function destroy(cb) { 
  cb();
}

//---------------------------------------------------------------------------

 var handlers = {
   getattr: getattr,
   readdir: readdir,
   open: open,
   read: read,
//   write: write,
//   release: release,
//   create: create,
//   unlink: unlink,
//   rename: rename,
//   mkdir: mkdir,
//   rmdir: rmdir,
   // init: init,
   // destroy: destroy,
   // setxattr: setxattr,
   statfs: statfs
};


function main() {
  
  console.log('main');
      f4js.start(mountFile, handlers, true);
    };

exports.main = main;
exports.load = load;
exports.loadConfig = loadConfig;
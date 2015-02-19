"use strict";

var child_process = require('child_process');
var fs            = require ('fs');
var f4js          = require('fuse4js');

var files_xmpp = null;
var fuse       = null;
var mountFile  = null;
var ERROR      = -2;

function load(modules)
{
  files_xmpp = modules.files_xmpp;
  fuse       = modules.fuse;
  mountFile  = modules.settings.mountFile;
  console.log("loaded");
}

function canMount()
{
  return fuse.canMount();
}

/**
 * Handler for the getattr() system call.
 *
 * PARAMETERS:
 *    path - the path to the file
 *    cb   - a callback of the form cb(err, stat), where err is the Posix return code
 *           and stat is the result in the form of a stat structure (when err === 0)
 */
function getattr(path, cb) 
{
  var stat = {};

  files_xmpp.getAttr(path,
    function(err, attrs)
    {
      if(err == 0)
      {
        stat.size = attrs.size;
        stat.mode = attrs.mode;
      } 
      else
      {
        err = ERROR;    
        cb(err, stat);
      }
    });

  console.log("got attribute");
};

/**
 * Handler for the readdir() system call.
 *
 * PARAMETERS:
 * path - the path to the file
 * cb   - a callback of the form cb(err, names), where err is the Posix return code
 *        and names is the result in the form of an array of file names (when err === 0)
 */
function readdir(path, cb) 
{
  console.log('readdir');
  files_xmpp.readDir(path,
    function(err, names)
    {
      if(err != 0)
      {
        err = ERROR;
        // console.log ('names: '+names);
        cb(err, names);
      }
    });
}

/*
 * Handler for the open() system call.
 * path: the path to the file
 * flags: requested access flags as documented in open(2)
 * cb: a callback of the form cb(err, [fh]), where err is the Posix return code
 *     and fh is an optional numerical file handle, which is passed to subsequent
 *     read(), write(), and release() calls.
 */
function open(path, flags, cb) {
  console.log('open');
  cb(0); // We don't return a file handle, so fuse4js will initialize it to 0
}

/**
 * Handler for the read() system call.
 *
 * PARAMETERS:
 * path   - the path to the file
 * offset - the file offset to read from
 * len    - the number of bytes to read
 * buf    - the Buffer to write the data to
 * fh     - the optional file handle originally returned by open(), or 0 if it wasn't
 * cb     - a callback of the form cb(err), where err is the Posix return code.
 *          A positive value represents the number of bytes actually read.
 */
function read(path, offset, len, buf, fh, cb) {
  console.log('read');
  files_xmpp.read(path,offset,len, function(err,data,length){
    if(err == 0)
    {
      err = length;
      buf.write(data, 0, length, 'ascii');
    }
    else
    {
      err = ERROR;
    }
    cb(err);
  });
}

/**
 * Handler for the init() FUSE hook. You can initialize your file system here.
 * cb: a callback to call when you're done initializing. It takes no arguments.
 */
function init(cb) {
  console.log('init');
  cb();
}

/**
 * Handler for the setxattr() FUSE hook. 
 *
 * PARAMETERS differ between different operating systems:
 * Darwin(Mac OSX):
 *    a = position
 *    b = options
 *    c = cmd
 * Other:
 *    a = flags
 *    b = cmd
 *    c = undefined
 */
function setxattr(path, name, value, size, a, b, c) {
  console.log('setxattr');
  cb(0);
}

/**
 * Handler for the statfs() FUSE hook. 
 *
 * PARAMETERS:
 * cb - a callback of the form cb(err, stat), where err is the Posix return code
 *      and stat is the result in the form of a statvfs structure (when err === 0)
 */
function statfs(cb) {
  console.log("statfs");
  cb(0, 
  {
    bsize:   1000000,
    frsize:  1000000,
    blocks:  1000000,
    bfree:   1000000,
    bavail:  1000000,
    files:   1000000,
    ffree:   1000000,
    favail:  1000000,
    fsid:    1000000,
    flag:    1000000,
    namemax: 1000000
  });
}

/*
 * Handler for the destroy() FUSE hook. You can perform clean up tasks here.
 *
 * PARAMETERS:
 * cb - a callback to call when you're done. It takes no arguments.
 */
function destroy(cb) { 
  console.log('destroy');
  cb();
}

var handlers = {
  getattr: getattr,
  readdir: readdir,
  open: open,
  read: read,
  statfs: statfs
};

function start()
{
  f4js.start(mountFile, handlers, true);
  console.log("fuse started");
}

exports.load     = load;
exports.canMount = canMount;
exports.start    = start;

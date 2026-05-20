/*
 * Coverage exercise tests for participants.
 *
 * Uncomment one or more tests in a branch, open a pull request, and compare the
 * coverage comment before and after the change. These tests intentionally cover
 * tar-fs options that the baseline suite leaves untouched.
 */

// var test = require('tape')
// var tar = require('../index')
// var path = require('path')
// var fs = require('fs')
// var rimraf = require('rimraf')

// test('coverage exercise: readable option widens modes', function (t) {
//   t.plan(1)
//
//   var source = path.join(__dirname, 'fixtures', 'a')
//   var target = path.join(__dirname, 'fixtures', 'copy', 'coverage-readable')
//
//   rimraf.sync(target)
//   tar.pack(source, {readable: true})
//     .pipe(tar.extract(target))
//     .on('finish', function () {
//       var mode = fs.statSync(path.join(target, 'hello.txt')).mode & parseInt(777, 8)
//       t.ok(mode & parseInt(444, 8))
//     })
// })


// test('coverage exercise: custom mapStream is used', function (t) {
//   t.plan(1)
//
//   var source = path.join(__dirname, 'fixtures', 'a')
//   var target = path.join(__dirname, 'fixtures', 'copy', 'coverage-map-stream')
//   var called = false
//
//   rimraf.sync(target)
//   tar.pack(source, {mapStream: function (stream) { called = true; return stream }})
//     .pipe(tar.extract(target))
//     .on('finish', function () {
//       t.ok(called)
//     })
// })
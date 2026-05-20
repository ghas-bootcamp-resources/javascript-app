var test = require('tape')
var tar = require('../index')
var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')

test('coverage baseline: pack returns a stream', function (t) {
  t.plan(1)

  var fixture = path.join(__dirname, 'fixtures', 'a')
  var pack = tar.pack(fixture)

  t.same(typeof pack.pipe, 'function')
  pack.destroy()
})


test('coverage baseline: extract ignores entries with filter', function (t) {
  t.plan(1)

  var source = path.join(__dirname, 'fixtures', 'a')
  var target = path.join(__dirname, 'fixtures', 'copy', 'coverage-ignore')

  rimraf.sync(target)
  tar.pack(source)
    .pipe(tar.extract(target, { ignore: function () { return true } }))
    .on('finish', function () {
      t.same(fs.existsSync(target), false)
    })
})
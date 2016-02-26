#!/usr/bin/env node

import program from 'commander'
import pkg from '../package'
import * as echo from './index'

program
  .version(pkg.version)
  .option('-p, --port <number>', 'port to listen on', Number)
  .option('-a, --address <address>', 'network address to listen on', String)

program
  .command('http')
  .description('start HTTP echo server')
  .action(() => echo.http(program))

program
  .command('tcp')
  .description('start TCP echo server')
  .action(() => echo.tcp(program))

program
  .command('udp')
  .description('start UDP echo server')
  .action(() => echo.udp(program))

program
  .command('*', false, { noHelp: true })
  .action(() => program.help())

program
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.help()
}

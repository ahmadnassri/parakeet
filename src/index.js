import _http from 'http'
import dgram from 'dgram'
import logger from 'oh-my-log'
import net from 'net'

const log = logger('client', {
  prefix: '[%__date:magenta]',
  locals: {
    'connect': '⚪',
    'disconnect': '⚫️️',
    'error': '✖️',
    'data': '✔',
    'start': '▶️',
    'stop': '❌'
  }
})

export function headerFormat (headers) {
  return Object.keys(headers).map(() => '%s:cyan: %s:yellow').join(' ')
}

export function tcp ({ port = undefined, address = '127.0.0.1' } = { address: '127.0.0.1' }) {
  let server = net.createServer()

  server.on('error', (err) => log('%error:red %s', err.toString()))
  server.on('listening', () => log('%start:green TCP %s:gray %d:yellow', server.address().address, server.address().port))
  server.on('close', () => log('%stop:red %s:gray %d:yellow', server.address().address, server.address().port))
  server.on('connection', (socket) => {
    log('%connect:green (%s:italic:dim %d:italic:gray)', socket.remoteAddress, socket.remotePort)

    socket.on('data', (data) => log('%data:cyan (%s:italic:dim %d:italic:gray) [%d:blue] %j', socket.remoteAddress, socket.remotePort, data.length, data.toString()))
    socket.on('error', (err) => log('%error:red (%s:italic:dim %d:italic:gray) %s', socket.remoteAddress, socket.remotePort, err.toString()))
    socket.on('end', () => log('%disconnect:red️ (%s:italic:dim %d:italic:gray)', socket.remoteAddress, socket.remotePort))

    socket.pipe(socket)
  })

  server.listen(port, address)
}

export function udp ({ port = undefined, address = '127.0.0.1' } = { address: '127.0.0.1' }) {
  var socket = dgram.createSocket('udp4')

  socket.on('error', (err) => log('error %s:yellow', err.message))
  socket.on('listening', () => log('%start:green UDP4 %s:gray %d:yellow', socket.address().address, socket.address().port))
  socket.on('close', () => log('%stop:red %s:gray %d:yellow', socket.address().address, socket.address().port))

  socket.on('message', (message, remoteAddress) => {
    log('%data:cyan (%s:italic:dim %d:italic:gray) [%d:blue] %j', remoteAddress.address, remoteAddress.port, message.length, message.toString())

    socket.send(message, 0, message.length, remoteAddress.port, remoteAddress.address)
  })

  socket.bind(port, address)
}

export function http ({ port = undefined, address = '127.0.0.1' } = { address: '127.0.0.1' }) {
  let server = _http.createServer()

  server.on('error', (err) => log('%error:red %s', err.toString()))
  server.on('listening', () => log('%start:green HTTP %s:gray %d:yellow', server.address().address, server.address().port))
  server.on('close', () => log('%stop:red %s:gray %d:yellow', server.address().address, server.address().port))
  server.on('connection', (socket) => log('%connect:green (%s:italic:dim %d:italic:gray)', socket.remoteAddress, socket.remotePort))
  server.on('request', (request, response) => {
    log('%data:cyan (%s:italic:dim %d:italic:gray) HTTP/%s:dim %s:green %s:blue', request.socket.remoteAddress, request.socket.remotePort, request.httpVersion, request.method, request.url)
    log(`%data:cyan (%s:italic:dim %d:italic:gray) ${headerFormat(request.headers)}`, request.socket.remoteAddress, request.socket.remotePort, ...request.rawHeaders)

    response.writeHead(200, { 'Content-Type': request.headers['content-type'] || 'text/plain' })

    request.on('data', (data) => {
      log('%data:cyan (%s:italic:dim %d:italic:gray) [%d:blue] %s', request.socket.remoteAddress, request.socket.remotePort, data.length, data.toString())

      response.write(data)
    })

    if (request.rawTrailers.length > 0) {
      log(`%data:cyan (%s:italic:dim %d:italic:gray) ${headerFormat(request.trailers)}`, request.socket.remoteAddress, request.socket.remotePort, ...request.rawTrailers)
    }

    request.on('end', () => {
      log('%disconnect:red️ (%s:italic:dim %d:italic:gray)', request.socket.remoteAddress, request.socket.remotePort)

      response.end()
    })

    request.on('error', (err) => log('%error:red (%s:italic:dim %d:italic:gray) %s', request.socket.remoteAddress, request.socket.remotePort, err.toString()))
  })

  server.listen(port, address)
}

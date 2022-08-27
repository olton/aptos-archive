import http from "http";
import fs from "fs";
import path from "path";
import {WebSocketServer, WebSocket} from "ws";
import express from "express";
import session from "express-session"
import favicon from "serve-favicon"
import {fileURLToPath} from "url";
import {info} from "../helpers/logging.js";
import {readJson} from "../helpers/readers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.resolve(path.dirname(__dirname), "public")
const rootPath = path.dirname(path.dirname(__dirname))
const packageJson = readJson(path.resolve(rootPath, 'package.json'))

const app = express()

const route = () => {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: 'Russian warship - Fuck You!',
        cookie: {
            maxAge: 24 * 3600000,
            secure: 'auto'
        }
    }))

    app.use(express.static(path.join(srcPath, 'public')))

    app.use('/css', express.static(path.join(clientPath, 'css')))
    app.use('/js', express.static(path.join(clientPath, 'js')))
    app.use('/vendor', express.static(path.join(clientPath, 'vendor')))
    app.use('/images', express.static(path.join(clientPath, 'images')))

    if (fs.existsSync(path.resolve(clientPath, 'favicon.ico')))
        app.use(favicon(path.resolve(clientPath, 'favicon.ico')))

    app.locals.pretty = true
    app.set('views', clientPath)
    app.set('view engine', 'pug')

    const clientConfig = JSON.stringify({
        "server": {
            "host": config.client.server,
            "port": config.client.port,
            "secure": config.client.secure
        },
    })
    const dateFormat = JSON.stringify(config['date-format'])

    app.get('/', async (req, res) => {
        res.render('index', {
            title: appName,
            appVersion: packageJson.version,
            clientConfig,
            dateFormat,
        })
    })
}

export const runWebServer = () => {
    let httpWebserver

    httpWebserver = http.createServer({}, app)

    const runInfo = `Aptos Archive Node running on http://${config.host}:${config.port}`

    route()

    httpWebserver.listen(config.port, () => {
        info(runInfo)
    })

    websocket(httpWebserver)
}

export const websocket = (server) => {
    globalThis.wss = new WebSocketServer({ server })

    wss.on('connection', (ws, req) => {

        const ip = req.socket.remoteAddress

        ws.send(JSON.stringify({
            channel: "welcome"
        }))

        ws.on('message', async (msg) => {
            const {channel, data} = JSON.parse(msg)
            router(ws, channel, data)
        })
    })
}

export const response = (ws, channel, data) => {
    ws.send(JSON.stringify({
        channel,
        data
    }))
}

export const broadcast = (data) => {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data))
        }
    })
}

const router = async (ws, channel, data) => {
    switch (channel) {
        case "api::ledger": {response(ws, channel, globalThis.ledger);break}
        case "api::archive": {response(ws, channel, globalThis.archive);break}
        case "api::transactions::count": {response(ws, channel, globalThis.counters);break}
        case "api::gas::count": {response(ws, channel, globalThis.gasCount);break}
        case "api::coin::transfer": {response(ws, channel, globalThis.coinTransfer);break}
        case "api::coin::mint": {response(ws, channel, globalThis.coinMint);break}
        case "api::transactions::last": {
            const transactions = await arch.transactions({order: "version::bigint desc", limit: data.limit, offset: 0})
            response(ws, channel, transactions)
            break
        }
        case "api::collections::count": {response(ws, channel, globalThis.collectionsCount);break}
        case "api::tokens::count": {response(ws, channel, globalThis.tokensCount);break}
        case "api::addresses::count": {response(ws, channel, globalThis.addressesCount);break}

        case "api::transactions::list": {
            try {
                response(ws, channel, await arch.transactions({
                    order: data.order,
                    limit: data.limit,
                    start: data.start
                }))
            } catch (e) {
                response(ws, channel, {
                    error: e.message
                })
            }
            break
        }

        case "api::transactions::user": {
            try {
                response(ws, channel, await arch.user_transactions({
                    order: data.order,
                    limit: data.limit,
                    start: data.start
                }))
            } catch (e) {
                response(ws, channel, {
                    error: e.message
                })
            }
            break
        }

        case "api::transactions::meta": {
            try {
                response(ws, channel, await arch.meta_transactions({
                    order: data.order,
                    limit: data.limit,
                    start: data.start
                }))
            } catch (e) {
                response(ws, channel, {
                    error: e.message
                })
            }
            break
        }

        case "api::transactions::state": {
            try {
                response(ws, channel, await arch.state_transactions({
                    order: data.order,
                    limit: data.limit,
                    start: data.start
                }))
            } catch (e) {
                response(ws, channel, {
                    error: e.message
                })
            }
            break
        }
    }
}
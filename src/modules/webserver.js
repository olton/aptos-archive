import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import {WebSocketServer, WebSocket} from "ws";
import assert from "assert";
import express from "express";
import session from "express-session"
import favicon from "serve-favicon"
import {fileURLToPath} from "url";
import {info} from "../helpers/logging.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.resolve(__dirname, "public")

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
        app.use(favicon(path.join(srcPath, 'client', 'favicon.ico')))

    app.locals.pretty = true
    app.set('views', path.resolve(srcPath, 'public'))
    app.set('view engine', 'pug')

    const clientConfig = JSON.stringify({
        "server": {
            "host": config.host,
            "port": config.port,
            "secure": config.secure === true
        },
    })
    const dateFormat = JSON.stringify(config['date-format'])

    app.get('/', async (req, res) => {
        res.render('index', {
            title: appName,
            appVersion,
            config: clientConfig,
            dateFormat,
        })
    })
}

export const runWebServer = () => {
    let httpWebserver

    httpWebserver = http.createServer({}, app)

    const runInfo = `Aptos Archive Node running on http://${config.host}:${config.port}`

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
            channel: "welcome",
            data: `Welcome to Server v${appVersion}`
        }))

        ws.on('message', async (msg) => {
            const {channel, data} = JSON.parse(msg)

            switch (channel) {
                case "ledger": {
                    response(ws, channel, {ledger: cache.ledger})
                    break
                }
            }
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

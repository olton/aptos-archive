# Welcome to Aptos Archive

## Install
```shell
git clone https://github.com/olton/aptos-archive.git
```

## Init
```shell
cd aptos-archive
npm install
```

## Start
```shell
node src/index.js
```

Before start, you must update `config.json`
```shell
cp src/config.examle.json src/config.json
```
Edit `config.json` and set your parameters

## Config file
```json
{
    "host": "localhost",
    "port": 80,
    "client": {
        "server": "localhost",
        "port": 80,
        "secure": false
    },
    "aptos": {
        "api": "http://fullnode.aptos.net.ua:8080/v1"
    },
    "db": {
        "host": "localhost",
        "port": 5432,
        "database": "archive",
        "user": "",
        "password": ""
    },
    "date-format": {
        "log": "DD/MM/YYYY HH:mm:ss",
        "log_am": "MM/DD/YYYY HH:mm:ss",
        "full": "DD, MMM YYYY HH:mm:ss",
        "date": "DD, MMM YYYY",
        "datetime": "DD, MMM YYYY HH:mm",
        "time": "HH:mm"
    },
    "debug": {
        "pg_query": false
    }
}
```
> Data for `user/password` you can request from the author on Discord Server Aptos.
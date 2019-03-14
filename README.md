# Pulsar
> Pulsar is the Vue.js web interface for the European Financial Transparency Gateway (EFTG) first Pan-European Blockchain. Currently serving the OAM and Investor pages

## Installation

#### Docker

We recommend docker to use Pulsar. An image is already available on dockerhub

To bring up a running container it's as simple as this:
```
docker run -it -p 80:80 eftg/pulsar
```

If you would like to modify, build, and run Pulsar using docker, it's as simple as pulling in the github repo and issuing one command to build it, like this:
```
git clone https://github.com/pablomat/pulsar.git
cd pulsar
docker build -t "myname/mypulsar:mybranch" .
docker run -it -p 80:80 myname/mypulsar:mybranch
```

## Building from source without Docker

#### Config

Change the configuration file `src/config.js` with the symbols of the blockchain. (By default EFTG values are used)

Additional values are needed like an RPC node address (e.g.: https://api.eftg.eu), an [imagehoster](https://github.com/steemit/imagehoster), an elastic search API address and a CDN as well. 

#### Install dependencies & build
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run serve

# build for production with minification
npm run build
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

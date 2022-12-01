## SSR proxy

### Server side renderer proxy to single page applications

Make SEO/Social sharing easy for SPA (Angular/React/Vue JS)

**Ex:** 

Original page: https://shop.exaple.com/product/1135

This proxy started on **localhost** port **8888** with `originURL`=https://shop.example.com

\==> SSR page: http://localhost:8888/product/1135

---

### Usage

**Note**: NodeJS version ≥ 14

**Installation**

```
$ npm install
```

**Configuration**  
File : config/default.json

```
{
  "port": 8888,
  "originURL": "http://localhost:4200"
}
```

If `NODE_ENV=dev`, file `config/dev.json` should applied

**Run**

```
$ node index.mjs
```

For `dev` environment

```
$ NODE_ENV=dev node index.mjs
```

### Docker

**Build image**
```
$ docker build -t ssr-proxy-staging --build-arg ENV=staging .
```

**Run**
```
docker run --name=merchant-store-ssr-staging -p 8888:8888 ssr-proxy-staging
```

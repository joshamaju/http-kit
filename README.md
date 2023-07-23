# Http Kit

Compose requests and responses without worrying about the execution environment

## Features

- Supports Request and Response interceptors
- Native Web Platform APIs
- Type safety, correctly typed responses and errors
- Cross platform i.e Deno, Node etc
- Inversion of control i.e Dependency injection
- Extendable using adapters
- Request and Response utilities
- Dependency injection (powered by `effect`)

## Install

```bash
npm i effect
npm i http-kit
```

> Http Kit depends on the `effect` package

## Example

```ts
import * as Req from "http-kit/request";
import * as Res from "http-kit/response";
import * as Fetcher from 'http-kit/fetch';

type User = {id: string, name: string};

const get_users = pipe(
    Req.get('http://localhost:3000/api/users'),
    Res.filterStatusOk(),
    Res.parseJson<User>()
)

const users = await Fetcher.execute(get_users)
```

### Interceptors

```ts
const users = await Fetcher.execute(get_users, [
    {
        name: 'attach-token-interceptor',
        request(req) {
            const clone = req.clone();
            const headers = new Headers(clone.headers);
            headers.set('Authorization', 'token');
            return Effect.succeed(new Req.Request(clone.url, {...clone.init, headers}))
        }
    }
])
```
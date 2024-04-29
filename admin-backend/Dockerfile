FROM rust:1.77-alpine3.19 AS build

RUN apk add libc-dev

WORKDIR /app

RUN \
  --mount=source=Cargo.lock,target=Cargo.lock \
  --mount=source=Cargo.toml,target=Cargo.toml \
  --mount=source=src,target=src \
  --mount=source=build.rs,target=build.rs \
  --mount=source=migrations,target=migrations \
  --mount=type=cache,target=target \
  --mount=type=cache,target=/usr/local/cargo/registry \
  cargo build --release --locked && cp ./target/release/backend /app

FROM alpine:3.19 AS runtime

WORKDIR /app

COPY --from=build /app/backend .

EXPOSE 9000

CMD [ "./backend" ]


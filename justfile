default:
    just -h

clean:
    rm -rf ./bin

compile:
    tsc

run:
    npm run dev

cleanbuild:
    just clean
    just compile

cleanrun:
    just cleanbuild
    node .

docker-dev:
    docker compose -f docker-compose-dev.yml up --build

docker-prod:
    docker compose -f docker-compose-prod.yml up -d
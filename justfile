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

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { readFileSync } from "fs";

import services from "./mainDetails/services";
import skills from "./skills/skills";

const app = express();

app.use(cors());
app.use(
    bodyParser.json({
        type(req) {
            return true;
        },
    })
);
app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    next();
});

function fortune(res, body = null, status = 200) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.3) {
                res.status(status).send(JSON.stringify(body));
                resolve();
                return;
            }
            reject();
        }, 1000);
    });
}

// MainDetails Request

app.get('/api/services', (req, res) => {
    const body = services.map(o => ({ id: o.id, name: o.name, price: o.price }))
    return fortune(res, body).catch(() =>
        res.status(500).send("Something went wrong")
    );
});
app.get('/api/services/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = services.findIndex(o => o.id === id);
    if (index === -1) {
        const status = 404;
        return fortune(res, null, status).catch(() =>
            res.status(500).send("Something went wrong")
        );
    }
    const body = services[index];
    return fortune(res, body).catch(() =>
        res.status(500).send("Something went wrong")
    );
});

// Skills Request

let isEven = true;
app.get("/api/search", async (req, res) => {
    if (Math.random() > 0.75) {
        return res.status(500).end();
    }
    const { q } = req.query;
    return new Promise((resolve, reject) => {
        setTimeout(
            () => {
                const data = skills.filter((o) =>
                    o.name.toLowerCase().startsWith(q.toLowerCase())
                );
                res.send(JSON.stringify(data));
                resolve();
            },
            isEven ? 1000 : 5 * 1000
        );
        isEven = !isEven;
    });
});

// NewsFeed Request

const news = JSON.parse(readFileSync("./newsFeed/news.json"));
const limit = 5;

app.get("/api/news", (req, res) => {
    const { lastSeenId } = req.query;
    if (lastSeenId === undefined) {
        return fortune(res, news.slice(0, limit)).catch(() =>
            res.status(500).send("Something went wrong")
        );
    }

    const id = Number(lastSeenId);
    if (Number.isNaN(id)) {
        const status = 400;
        return fortune(res, null, status).catch(() =>
            res.status(500).send("Something went wrong")
        );
    }

    const index = news.findIndex((o) => o.id === id);
    if (index === -1) {
        const status = 404;
        return fortune(res, null, status).catch(() =>
            res.status(500).send("Something went wrong")
        );
    }

    const body = news.slice(index + 1, index + 1 + limit);
    return fortune(res, body).catch(() =>
        res.status(500).send("Something went wrong")
    );
});


const port = process.env.PORT || 7070;
app.listen(port, () => console.log(`The server is running on port ${port}.`));


const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

function clean(html) {
    const $ = cheerio.load(html);

    // remove junk
    $("script, style, nav, footer, iframe, noscript").remove();

    let text = $("body").text();

    // clean whitespace
    text = text.replace(/\s+/g, " ").trim();

    return text.slice(0, 8000);
}

// 🌐 BROWSER ROUTE
app.get("/browse", async (req, res) => {
    try {
        let url = req.query.url;

        if (!url) return res.json({ error: "No URL" });

        if (!url.startsWith("http")) {
            url = "https://" + url;
        }

        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            },
            timeout: 10000
        });

        res.json({
            url,
            content: clean(response.data)
        });

    } catch (err) {
        res.json({
            error: "Failed to load page"
        });
    }
});

// 🔎 SEARCH (optional)
app.get("/search", async (req, res) => {
    try {
        const q = req.query.q;
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;

        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        res.json({
            url,
            content: clean(response.data)
        });

    } catch {
        res.json({ error: "Search failed" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Stable proxy running on " + PORT);
});

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

function clean(html) {
    const $ = cheerio.load(html);

    $("script, style, nav, footer, iframe, noscript").remove();

    let text = $("body").text();
    text = text.replace(/\s+/g, " ").trim();

    return text.slice(0, 5000);
}

app.get("/browse", async (req, res) => {
    try {
        let url = req.query.url;
        if (!url) return res.json({ error: "No URL" });

        if (!url.startsWith("http")) {
            url = "https://" + url;
        }

        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 8000
        });

        res.json({
            url,
            content: clean(response.data)
        });

    } catch (err) {
        res.json({ error: "Failed to load page" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Browser proxy running on port " + PORT);
});

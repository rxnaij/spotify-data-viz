import express, { request } from 'express';
import querystring from 'querystring';
import fetch from 'node-fetch';
require('dotenv').config();

// initialize app
const app = express();
const port = 3000;

// get environment variables
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI || `http://localhost:${port}/callback`

app.get("/", (req, res) => {
    res.send(`
        <p>Hello world!</p>
        <a href="/login">Go to login</a>
    `);
});

app.get("/login", (req, res) => {

    // Request Spotify app authorization from user

    res.redirect(
        'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id,
            scope: ``,
            redirect_uri,
            state: Math.random()
        })
    );
})

app.get("/callback", async (req, res) => {

    // Request refresh and access tokens

    const code = req.query.code || null
    const state = req.query.state || null

    // Make request to Spotify for access token

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ":" + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }, 
        body: new URLSearchParams(
            Object.entries({
                grant_type: 'authorization_code',
                code,
                redirect_uri,
            })
            .map(([ key, value ]) => key + '=' + value)
            .join('&')
        )
    }).then(async response => {

        // Verify access token data received
        
        try {
            const data = await response.json();
            console.log(data);
            return data;
        } catch(error) {
            console.log("Error!");
            console.error(error)
        }
    }).then(async data => {

        // Use access token to request data from Spotify

        const { access_token } = data;
        const id = `1klALx0u4AavZNEvC4LrTL`;
        const albumData = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        });
        console.log(await albumData.json());
    });
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
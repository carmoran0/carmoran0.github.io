const clientId = '1e4caf68abfd436fa4cada7d8da95ac6';
const clientSecret = 'b58a1dc21b7f499a8245f512567d8dd1';

export async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

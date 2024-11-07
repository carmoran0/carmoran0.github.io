const clientId = '1e4caf68abfd436fa4cada7d8da95ac6'; // ID del cliente de Spotify
const redirectUri = 'http://localhost:5500/callback.html'; // URI de redirección después de la autorización
const scopes = 'user-read-currently-playing'; // Alcances necesarios

export function getAuthorizationUrl() {
    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('response_type', 'token');
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', scopes);
    return url.toString();
}

export function getAccessTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

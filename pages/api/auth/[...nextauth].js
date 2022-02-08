import NextAuth from "next-auth";
import SpotifyProvider from 'next-auth/providers/spotify'
import spotifyApi, { LOGIN_URL } from '../../../lib/spotify'

const refreshAccessToken = async (token) => {
    try{
        spotifyApi.setAccessToken (token.accessToken)
        spotifyApi.setRefreshToken (token.refreshToken)

        // destructure the refresh token from the spotify api put it into the body variable and rename the body variable to refreshedToken
        const { body: refreshedToken } = await spotifyApi.refreshAccessToken ()
        console.log ('Refresh Token is: ', refreshedToken)

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now () + refreshedToken.expires_in * 1000,      // = 1 hour as 3600 returns from spotify Api
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken            // refresh if new one came back otherwise use the old refresh token
        }

    }catch (error) {
        console.error (error)

        return {
            ...token,
            error: 'RefreshAccessTokenError'
        }
    }
}


export default NextAuth ({
    // Configure one or more authentication providers
    providers : [
        SpotifyProvider ({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
            authorization: LOGIN_URL
        })
    ],

    secret: process.env.JWT_SECRET,

    pages: {
        signIn: '/login'                            // when we go to this page it will ask us to login if not already logged in
    },
    

    callbacks: {
        // destructure them from the spotify account
        async jwt ({ token, account, user }){
            // initial sign in
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    username: account.providerAccountId,
                    accessTokenExpires: account.expires_at * 1000        // we are handling expiry times in milliseconds hence * 1000
                }
            }

            // return the previous token if the access token has not expired yet
            if (Date.now() < token.accessTokenExpires) {
                console.log ("Existing Token is VALID")
                return token
            }

            // Access toke has expired, so we need to refresh it
            console.log ('Access token has EXPIRED, REFRESHING...')
            return await refreshAccessToken (token)
        },
        
        async session ({ session, token }) {
            session.user.accessToken = token.accessToken
            session.user.refreshToken - token.refreshToken
            session.user.username = token.username

            return session
        }

    },

})
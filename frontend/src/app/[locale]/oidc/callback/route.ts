import {useLocale} from "next-intl";
import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    const locale = useLocale()
    const searchParams = request.nextUrl.searchParams

    const code = searchParams.get('code')!

    const clientId = process.env.NEXT_PUBLIC_OPENID_CLIENT_ID!
    const tokenURL = process.env.NEXT_PUBLIC_OPENID_TOKEN_URL!
    const redirectURI = process.env.NEXT_PUBLIC_OPENID_REDIRECT_URI!.replace('{LOCALE}', locale)
    const grantType = "authorization_code"
    const formData = new URLSearchParams({
        grant_type: grantType,
        redirect_uri: redirectURI,
        client_id: clientId,
        code: code,
    }).toString()

    const response = await fetch(tokenURL, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })

    if (!response.ok) {
        console.log(response.status)
        console.log(await response.text())
        throw Error("Request token failed")
    }

    const cookieStore = cookies()

    const data = await response.json() as Record<string, string>
    const jwtCookies = ([
        'access_token',
        'refresh_token',
        'expires_in',
        'refresh_expires_in',
        'token_type',
        'not-before-policy',
        'session_state',
        'scope',
    ] as Array<string>)

    jwtCookies.forEach(cookieName => cookieStore.set({name: cookieName, value: data[cookieName]}))

    return NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL + "/")
}

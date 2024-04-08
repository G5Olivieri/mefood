import {useLocale, useTranslations} from 'next-intl';
import Link from "next/link";

export default function Index() {
    const locale = useLocale()
    const t = useTranslations('Index');
    const buildSignInURL = () => {
        const clientId = process.env.NEXT_PUBLIC_OPENID_CLIENT_ID!
        const authURL = process.env.NEXT_PUBLIC_OPENID_AUTH_URL!
        const redirectURI = process.env.NEXT_PUBLIC_OPENID_REDIRECT_URI!.replace('{LOCALE}', locale)
        const responseType = "code"
        const query = new URLSearchParams({
            response_type: responseType,
            redirect_uri: redirectURI,
            client_id: clientId,
            scope: 'openid'
        }).toString()
        return `${authURL}?${query}`
    }
    return (
        <>
            <h1>{t('title')}</h1>
            <Link href={buildSignInURL()}>{t('signin')}</Link>
        </>
    );

}
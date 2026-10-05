import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'NOVA — Above the Black Sea',description:'Arrival, emergence, ascent. A fictional architectural concept in Batumi, Georgia. No property offering.',icons:{icon:'/icon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

import { validRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import { ReactNode } from "react";
import Navbar from "./Navbar";




export default async function Layout({children}:{children:ReactNode}){
const session = await validRequest();

if(!session?.user) redirect('/login');


return(
    <SessionProvider value={session}>
        <div className="h-screen flex flex-col">
       <Navbar />
       <div className="mx-auto max-w-7xl">
        {children}
       </div>
        </div>
    </SessionProvider>
)
}
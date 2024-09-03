import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import db from "./lib/db";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";


const adapter = new PrismaAdapter(db.session , db.user);

export const lucia = new Lucia(adapter,{
    sessionCookie:{
        expires:false,
        attributes:{
            secure:process.env.NODE_ENV === 'production',
        }
    },
    getUserAttributes(databaseUserAttributes) {
        return{
            id:databaseUserAttributes.id,
            username:databaseUserAttributes.username,
            displayName:databaseUserAttributes.displayName,
            googleId:databaseUserAttributes.googleId,
            avatarUrl:databaseUserAttributes.avatarUrl,
        }
    },
});

declare module 'lucia'{
    interface Register{
        Lucia:typeof lucia;
        DatabaseUserAttributes:DatabaseUserAttributes;
    }
};

interface DatabaseUserAttributes{
    id:string,
    username:string,
    displayName:string,
    googleId:string|null,
    avatarUrl:string|null
}

export const validRequest = cache(
    async():Promise<{user:User , session:Session} | {user:null ,session:null}> =>{

        const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

        if(!sessionId){
            return{
                user:null,
                session:null
            };
        };

        const result = await lucia.validateSession(sessionId);

        try {
            if(result.session && result.session.fresh){
                const sessionCookie = lucia.createSessionCookie(result.session.id);
                cookies().set(
                    sessionCookie.name,
                    sessionCookie.value,
                    sessionCookie.attributes
                )
            };

            if(!result.session){
                const sessionCookie = lucia.createBlankSessionCookie();
                cookies().set(
                    sessionCookie.name,
                    sessionCookie.value,
                    sessionCookie.attributes
                )
            }
        } catch{}

        return result;
    }
)